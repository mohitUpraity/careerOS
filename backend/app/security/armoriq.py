import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

logger = logging.getLogger("career_os.armoriq")

class ArmorIQEngine:
    def __init__(self):
        # Maps agent_name -> (private_key, public_key)
        self._keys: Dict[str, Tuple[rsa.RSAPrivateKey, rsa.RSAPublicKey]] = {}
        self._initialize_agent_keys()
        
    def _initialize_agent_keys(self):
        agents = [
            "Commander", 
            "DiscoveryAgent", 
            "ATSAgent", 
            "MatchingAgent", 
            "RankingAgent", 
            "ResumeAgent", 
            "ApplicationAgent"
        ]
        for agent in agents:
            # Generate 2048-bit RSA keypair for each agent
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )
            public_key = private_key.public_key()
            self._keys[agent] = (private_key, public_key)
            logger.info(f"Generated RSA keypair for agent: {agent}")

    def get_public_key_pem(self, agent_name: str) -> str:
        if agent_name not in self._keys:
            raise ValueError(f"Unknown agent: {agent_name}")
        public_key = self._keys[agent_name][1]
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return pem.decode('utf-8')

    def create_delegation_token(
        self, 
        plan_id: str, 
        parent_agent: str, 
        child_agent: str, 
        scopes: List[str], 
        ttl_seconds: int = 3600
    ) -> str:
        """
        Creates a cryptographically signed delegation token.
        Signed by the parent_agent's private key.
        """
        if parent_agent not in self._keys:
            raise ValueError(f"Unknown parent agent: {parent_agent}")
        if child_agent not in self._keys:
            raise ValueError(f"Unknown child agent: {child_agent}")
            
        expires_at = (datetime.utcnow() + timedelta(seconds=ttl_seconds)).isoformat()
        
        claims = {
            "plan_id": plan_id,
            "parent_agent": parent_agent,
            "child_agent": child_agent,
            "allowed_scopes": scopes,
            "expires_at": expires_at
        }
        
        # Serialize claims to JSON
        claims_bytes = json.dumps(claims).encode('utf-8')
        
        # Sign claims using parent private key
        parent_private_key = self._keys[parent_agent][0]
        signature = parent_private_key.sign(
            claims_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        # Return composite token: claims_json.hex() + "." + signature.hex()
        token = f"{claims_bytes.hex()}.{signature.hex()}"
        return token

    def verify_delegation_token(self, token_str: str) -> Dict[str, Any]:
        """
        Verifies the cryptographic signature of the delegation token
        using the parent agent's public key.
        """
        try:
            parts = token_str.split('.')
            if len(parts) != 2:
                raise ValueError("Invalid token format")
                
            claims_hex, sig_hex = parts[0], parts[1]
            claims_bytes = bytes.fromhex(claims_hex)
            signature = bytes.fromhex(sig_hex)
            
            claims = json.loads(claims_bytes.decode('utf-8'))
            parent_agent = claims["parent_agent"]
            
            if parent_agent not in self._keys:
                raise ValueError(f"Unknown parent agent: {parent_agent}")
                
            # Verify signature using parent public key
            parent_public_key = self._keys[parent_agent][1]
            parent_public_key.verify(
                signature,
                claims_bytes,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            # Check expiration
            expires_at = datetime.fromisoformat(claims["expires_at"])
            if datetime.utcnow() > expires_at:
                raise ValueError("Token has expired")
                
            return claims
        except Exception as e:
            logger.error(f"Delegation verification failed: {e}")
            raise ValueError(f"Invalid delegation token: {e}")

    def verify_tool_call(
        self,
        db,
        token_str: str,
        child_agent: str,
        tool_name: str,
        arguments: Dict[str, Any],
        plan_id: str
    ) -> Tuple[bool, str]:
        """
        Validates if the child_agent is authorized to execute tool_name.
        Logs the audit decision (ALLOW / BLOCK) directly into the database.
        """
        from app.models import AuditEvent, Delegation
        
        decision = "BLOCK"
        reason = ""
        delegation_id = None
        
        try:
            # 1. Parse and verify delegation token
            claims = self.verify_delegation_token(token_str)
            
            # Find delegation in DB if possible
            db_delegation = db.query(Delegation).filter(
                Delegation.delegation_token == token_str
            ).first()
            if db_delegation:
                delegation_id = db_delegation.id
                
            # 2. Verify target agent
            if claims["child_agent"] != child_agent:
                reason = f"Agent mismatch. Token issued to {claims['child_agent']}, but presented by {child_agent}."
            # 3. Verify scope authorization
            elif tool_name not in claims["allowed_scopes"]:
                reason = f"Scope violation. Tool '{tool_name}' is not in the delegated scope: {claims['allowed_scopes']}."
            else:
                decision = "ALLOW"
                reason = "Authorization verified."
        except Exception as e:
            reason = f"Security verification error: {e}"
            
        # Log to Database
        try:
            audit_event = AuditEvent(
                plan_id=plan_id,
                delegation_id=delegation_id,
                agent_name=child_agent,
                tool_name=tool_name,
                arguments=arguments,
                decision=decision,
                reason=reason,
                timestamp=datetime.utcnow()
            )
            db.add(audit_event)
            db.commit()
            db.refresh(audit_event)
        except Exception as db_err:
            logger.error(f"Failed to log audit event to DB: {db_err}")
            
        return (decision == "ALLOW", reason)

# Global singleton instance
armoriq_engine = ArmorIQEngine()
