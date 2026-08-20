import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import (
    Plan, 
    Delegation, 
    Opportunity, 
    Match, 
    Resume, 
    ResumeVersion, 
    Application, 
    AuditEvent
)
from app.security.armoriq import armoriq_engine
from app.services.matching import matching_engine
from app.services.tailoring import tailoring_service

logger = logging.getLogger("career_os.workflows")

# SSE Event Broadcaster
class EventBroadcaster:
    def __init__(self):
        self._listeners: List[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._listeners.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self._listeners:
            self._listeners.remove(q)

    def publish(self, event_type: str, data: Dict[str, Any]):
        event = {
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        for q in self._listeners:
            q.put_nowait(event)

event_broadcaster = EventBroadcaster()

class AgentWorkflowOrchestrator:
    @staticmethod
    async def run_prepare_and_submit_simulation(
        db_session: Session,
        user_id: str,
        intent: str,
        opportunity_id: str
    ) -> str:
        """
        Executes the complete multi-agent workflow:
        Commander -> Discovery -> ATS -> Matching -> Resume -> Application
        Simulates execution delays so the frontend can animate state transitions.
        Triggers an ArmorIQ Scope Violation on ApplicationAgent.submit_application().
        """
        # 1. Initialize Plan & Capture ArmorIQ Intent
        plan = Plan(user_id=user_id, intent=intent, status="active")
        db_session.add(plan)
        db_session.commit()
        db_session.refresh(plan)
        plan_id = plan.id
        
        captured_intent = armoriq_engine.capture_plan(
            plan_id=plan_id,
            user_email="mohit@careeros.ai",
            goal=intent,
            steps=[{"action": "prepare_and_submit", "target": opportunity_id}]
        )
        
        event_broadcaster.publish("agent.started", {
            "agent": "Commander",
            "message": f"Commander captured plan intent PLAN-{plan_id[:8]} [hash: {captured_intent['plan_hash'][:12]}] for: '{intent}'",
            "plan_id": plan_id
        })
        await asyncio.sleep(0.8)

        # 2. Commander generates cryptographic delegations for child agents
        scopes = {
            "DiscoveryAgent": ["search_jobs", "search_competitions", "get_opportunity"],
            "ATSAgent": ["read_resume", "analyze_resume_against_jd", "score_resume"],
            "MatchingAgent": ["read_profile", "read_opportunities", "calculate_match"],
            "ResumeAgent": ["read_resume", "create_resume_version"],
            "ApplicationAgent": ["prepare_application"] # Note: submit_application is EXCLUDED!
        }
        
        tokens = {}
        for agent, agent_scopes in scopes.items():
            token = armoriq_engine.delegate(
                plan_id=plan_id,
                parent_agent="Commander",
                child_agent=agent,
                scopes=agent_scopes
            )
            tokens[agent] = token
            
            # Save delegation to DB
            delegation = Delegation(
                plan_id=plan_id,
                parent_agent="Commander",
                child_agent=agent,
                allowed_scopes=agent_scopes,
                delegation_token=token,
                expires_at=datetime.utcnow() + timedelta_seconds(3600)
            )
            db_session.add(delegation)
            
            event_broadcaster.publish("agent.delegated", {
                "parent": "Commander",
                "child": agent,
                "scopes": agent_scopes,
                "token_preview": token[:15] + "...",
                "plan_id": plan_id
            })
            await asyncio.sleep(0.4)
            
        db_session.commit()

        # 3. Discovery Agent execution
        event_broadcaster.publish("agent.started", {
            "agent": "DiscoveryAgent",
            "message": "Discovery Agent starting search and details retrieval...",
            "plan_id": plan_id
        })
        await asyncio.sleep(1.2)
        
        # Verify Discovery tool call
        allowed, reason = armoriq_engine.invoke(
            db_session, tokens["DiscoveryAgent"], "DiscoveryAgent", "search_jobs", {}, plan_id
        )
        if allowed:
            event_broadcaster.publish("tool.allowed", {
                "agent": "DiscoveryAgent",
                "tool": "search_jobs",
                "decision": "ALLOW",
                "message": "ArmorIQ: Tool execution allowed.",
                "plan_id": plan_id
            })
        await asyncio.sleep(1.0)

        # Fetch opportunity details
        opp = db_session.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
        if not opp:
            event_broadcaster.publish("agent.completed", {
                "agent": "DiscoveryAgent",
                "message": "Discovery Agent finished. No matching opportunities found.",
                "plan_id": plan_id
            })
            plan.status = "failed"
            db_session.commit()
            return plan_id

        # 4. ATS & Matching Agent
        event_broadcaster.publish("agent.started", {
            "agent": "ATSAgent",
            "message": "ATS Agent starting resume suitability and keyword assessment...",
            "plan_id": plan_id
        })
        await asyncio.sleep(1.2)
        
        # Verify ATS tool call
        allowed, reason = armoriq_engine.verify_tool_call(
            db_session, tokens["ATSAgent"], "ATSAgent", "analyze_resume_against_jd", {}, plan_id
        )
        if allowed:
            event_broadcaster.publish("tool.allowed", {
                "agent": "ATSAgent",
                "tool": "analyze_resume_against_jd",
                "decision": "ALLOW",
                "message": "ArmorIQ: Tool execution allowed.",
                "plan_id": plan_id
            })
        await asyncio.sleep(1.0)

        # 5. Matching Agent
        event_broadcaster.publish("agent.started", {
            "agent": "MatchingAgent",
            "message": "Matching Agent calculating hybrid score factors...",
            "plan_id": plan_id
        })
        await asyncio.sleep(1.0)
        
        allowed, reason = armoriq_engine.verify_tool_call(
            db_session, tokens["MatchingAgent"], "MatchingAgent", "calculate_match", {}, plan_id
        )
        if allowed:
            event_broadcaster.publish("tool.allowed", {
                "agent": "MatchingAgent",
                "tool": "calculate_match",
                "decision": "ALLOW",
                "message": "ArmorIQ: Tool execution allowed.",
                "plan_id": plan_id
            })
            
            # Perform match scoring
            from app.models import Profile
            profile = db_session.query(Profile).filter(Profile.user_id == user_id).first()
            if profile:
                score, breakdown = matching_engine.calculate_match_score(db_session, profile, opp)
                # Save Match
                match = db_session.query(Match).filter(
                    Match.user_id == user_id, Match.opportunity_id == opp.id
                ).first()
                if not match:
                    match = Match(
                        user_id=user_id,
                        opportunity_id=opp.id,
                        overall_score=score,
                        ats_score=breakdown["ats_score"],
                        skill_score=breakdown["skills_score"],
                        experience_score=breakdown["experience_score"],
                        breakdown_json=breakdown
                    )
                    db_session.add(match)
                else:
                    match.overall_score = score
                    match.ats_score = breakdown["ats_score"]
                    match.skill_score = breakdown["skills_score"]
                    match.experience_score = breakdown["experience_score"]
                    match.breakdown_json = breakdown
                db_session.commit()
        await asyncio.sleep(1.0)

        # 6. Resume Agent tailoring
        event_broadcaster.publish("agent.started", {
            "agent": "ResumeAgent",
            "message": f"Resume Agent tailoring resume for '{opp.company}'...",
            "plan_id": plan_id
        })
        await asyncio.sleep(1.5)
        
        allowed, reason = armoriq_engine.verify_tool_call(
            db_session, tokens["ResumeAgent"], "ResumeAgent", "create_resume_version", {}, plan_id
        )
        
        resume_version_id = None
        if allowed:
            event_broadcaster.publish("tool.allowed", {
                "agent": "ResumeAgent",
                "tool": "create_resume_version",
                "decision": "ALLOW",
                "message": "ArmorIQ: Tool execution allowed.",
                "plan_id": plan_id
            })
            
            # Fetch baseline resume
            baseline = db_session.query(Resume).filter(
                Resume.user_id == user_id, Resume.is_baseline == True
            ).first()
            if baseline and profile:
                tailored_content, diff = tailoring_service.tailor_resume(profile, baseline.content_json, opp)
                
                # Save tailored version
                version = ResumeVersion(
                    resume_id=baseline.id,
                    opportunity_id=opp.id,
                    version_name=f"Tailored for {opp.company}",
                    content_json=tailored_content,
                    diff_summary=diff,
                    ats_score=match.ats_score if 'match' in locals() else 85.0
                )
                db_session.add(version)
                db_session.commit()
                db_session.refresh(version)
                resume_version_id = version.id
        await asyncio.sleep(1.0)

        # 7. Application Agent preparation
        event_broadcaster.publish("agent.started", {
            "agent": "ApplicationAgent",
            "message": "Application Agent drafting application fields...",
            "plan_id": plan_id
        })
        await asyncio.sleep(1.5)
        
        allowed, reason = armoriq_engine.verify_tool_call(
            db_session, tokens["ApplicationAgent"], "ApplicationAgent", "prepare_application", {}, plan_id
        )
        
        app_id = None
        if allowed:
            event_broadcaster.publish("tool.allowed", {
                "agent": "ApplicationAgent",
                "tool": "prepare_application",
                "decision": "ALLOW",
                "message": "ArmorIQ: Tool execution allowed.",
                "plan_id": plan_id
            })
            
            # Prepare mock application answers
            prepared_answers = {
                "Why are you interested in this role?": f"I am deeply passionate about the work {opp.company} is doing in this domain. My profile aligns with the required technologies.",
                "What is your experience with Python?": "I have used Python extensively in building automation pipelines and ML services.",
                "Desired Start Date": "Immediate"
            }
            
            # Save application to DB
            application = Application(
                user_id=user_id,
                opportunity_id=opp.id,
                status="approval_required", # Wait for human approval due to intercepted tool
                prepared_answers=prepared_answers,
                resume_version_id=resume_version_id
            )
            db_session.add(application)
            db_session.commit()
            db_session.refresh(application)
            app_id = application.id
            
        await asyncio.sleep(1.2)

        # 8. Scope Violation: Application Agent attempts submit_application
        event_broadcaster.publish("agent.started", {
            "agent": "ApplicationAgent",
            "message": "Application Agent attempting to finalize and submit application to company portal...",
            "plan_id": plan_id
        })
        await asyncio.sleep(1.5)
        
        # Verify submit_application tool call -> triggers BLOCK
        allowed, reason = armoriq_engine.verify_tool_call(
            db_session, 
            tokens["ApplicationAgent"], 
            "ApplicationAgent", 
            "submit_application", 
            {"application_id": app_id}, 
            plan_id
        )
        
        if not allowed:
            event_broadcaster.publish("tool.blocked", {
                "agent": "ApplicationAgent",
                "tool": "submit_application",
                "decision": "BLOCK",
                "reason": reason,
                "application_id": app_id,
                "message": f"ArmorIQ Security Intercept: {reason}",
                "plan_id": plan_id
            })
            
            # Update plan status to paused for approval
            plan.status = "waiting_for_approval"
            db_session.commit()
            
            event_broadcaster.publish("approval.required", {
                "agent": "ApplicationAgent",
                "tool": "submit_application",
                "application_id": app_id,
                "message": "System paused. Explicit human authorization required to execute submit_application.",
                "plan_id": plan_id
            })
            
        return plan_id

    @staticmethod
    async def approve_and_finalize_application(
        db_session: Session,
        application_id: str
    ) -> bool:
        """
        Processes human approval, overrides policy block, and completes the execution loop.
        """
        app = db_session.query(Application).filter(Application.id == application_id).first()
        if not app:
            return False
            
        # Update application status
        app.status = "submitted"
        
        # Find active plan for this user
        plan = db_session.query(Plan).filter(
            Plan.user_id == app.user_id, 
            Plan.status == "waiting_for_approval"
        ).order_by(Plan.created_at.desc()).first()
        
        plan_id = plan.id if plan else None
        
        # Log manual override to audit trail
        override_event = AuditEvent(
            plan_id=plan_id,
            agent_name="Commander",
            tool_name="submit_application",
            arguments={"application_id": application_id},
            decision="ALLOW",
            reason="Explicit human approval granted. Policy scope override activated.",
            timestamp=datetime.utcnow()
        )
        db_session.add(override_event)
        
        if plan:
            plan.status = "completed"
            
        db_session.commit()
        
        # Broadcast success events
        event_broadcaster.publish("tool.allowed", {
            "agent": "ApplicationAgent",
            "tool": "submit_application",
            "decision": "ALLOW",
            "message": "ArmorIQ: Execution allowed via human override.",
            "plan_id": plan_id
        })
        await asyncio.sleep(0.8)
        
        event_broadcaster.publish("agent.completed", {
            "agent": "ApplicationAgent",
            "message": "Application submitted successfully to company applicant portal.",
            "plan_id": plan_id
        })
        await asyncio.sleep(0.5)
        
        event_broadcaster.publish("agent.completed", {
            "agent": "Commander",
            "message": f"Commander completed plan PLAN-{plan_id[:8] if plan_id else ''} successfully.",
            "plan_id": plan_id
        })
        
        return True

def timedelta_seconds(seconds: int):
    from datetime import timedelta
    return timedelta(seconds=seconds)
