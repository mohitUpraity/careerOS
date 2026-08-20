import sys
import os
import unittest
from datetime import datetime

# Adjust path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.security.armoriq import armoriq_engine

class TestArmorIQ(unittest.TestCase):
    def test_keypair_generation(self):
        """
        Verify that agent public keys can be exported as valid PEM strings.
        """
        pem = armoriq_engine.get_public_key_pem("Commander")
        self.assertTrue(pem.startswith("-----BEGIN PUBLIC KEY-----"))
        self.assertTrue(pem.strip().endswith("-----END PUBLIC KEY-----"))

    def test_delegation_signing_and_verification(self):
        """
        Verify that a parent agent can sign a delegation token for a child,
        and that verification recovers the correct scopes.
        """
        plan_id = "test-plan-123"
        scopes = ["search_jobs", "get_opportunity"]
        
        token = armoriq_engine.create_delegation_token(
            plan_id=plan_id,
            parent_agent="Commander",
            child_agent="DiscoveryAgent",
            scopes=scopes,
            ttl_seconds=30
        )
        
        # Verify the token
        claims = armoriq_engine.verify_delegation_token(token)
        self.assertEqual(claims["plan_id"], plan_id)
        self.assertEqual(claims["parent_agent"], "Commander")
        self.assertEqual(claims["child_agent"], "DiscoveryAgent")
        self.assertEqual(claims["allowed_scopes"], scopes)

    def test_tampered_token_fails(self):
        """
        Verify that modifying the payload of a delegation token invalidates the signature.
        """
        token = armoriq_engine.create_delegation_token(
            plan_id="plan-1",
            parent_agent="Commander",
            child_agent="DiscoveryAgent",
            scopes=["search_jobs"],
            ttl_seconds=30
        )
        
        # Tamper with token payload (swap out a character in claims)
        parts = token.split('.')
        tampered_claims = parts[0]
        # Replace last character of claims string hex
        if tampered_claims[-1] == 'a':
            tampered_claims = tampered_claims[:-1] + 'b'
        else:
            tampered_claims = tampered_claims[:-1] + 'a'
            
        tampered_token = f"{tampered_claims}.{parts[1]}"
        
        with self.assertRaises(ValueError):
            armoriq_engine.verify_delegation_token(tampered_token)

if __name__ == '__main__':
    unittest.main()
