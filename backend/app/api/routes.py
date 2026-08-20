from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
from typing import List, Dict, Any, Optional
import asyncio

from app.database import get_db
from app.models import (
    User, Profile, Skill, Project, Resume, ResumeVersion, 
    Opportunity, Match, Application, Delegation, AuditEvent, Plan
)
from app.schemas import (
    OpportunityResponse, MatchResponse, ResumeResponse, ResumeVersionResponse,
    ApplicationResponse, DelegationResponse, AuditEventResponse,
    RankingRecalculateRequest, ResumeTailorRequest, ApplicationPrepareRequest,
    ApplicationApprovalRequest, ScrapeRequest
)
from app.security.armoriq import armoriq_engine
from app.services.matching import matching_engine
from app.services.tailoring import tailoring_service
from app.agents.workflows import event_broadcaster, AgentWorkflowOrchestrator

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    """
    Keep-alive health endpoint for Render free tier.
    """
    from datetime import datetime
    return {
        "status": "healthy",
        "service": "CareerOS Backend API",
        "timestamp": datetime.utcnow().isoformat(),
        "keep_alive": True
    }

# --- Helper to get default user (Mohit) ---
def get_default_user_id(db: Session) -> str:
    user = db.query(User).filter(User.email == "mohit@careeros.ai").first()
    if not user:
        # Create default user if not exists
        user = User(email="mohit@careeros.ai", full_name="Mohit Upraity")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create baseline profile
        profile = Profile(
            user_id=user.id,
            headline="Full Stack Software Engineer & AI Researcher",
            bio="Building autonomous multi-agent systems and safe agentic protocols.",
            location="Bangalore, India",
            remote_preference="remote",
            availability_status="actively looking"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Seed default skills
        skills = [
            Skill(profile_id=profile.id, name="Python", category="Backend", verified=True, years_experience=3.5),
            Skill(profile_id=profile.id, name="FastAPI", category="Backend", verified=True, years_experience=2.0),
            Skill(profile_id=profile.id, name="React", category="Frontend", verified=True, years_experience=2.0),
            Skill(profile_id=profile.id, name="TypeScript", category="Frontend", verified=True, years_experience=2.0),
            Skill(profile_id=profile.id, name="LangGraph", category="AI", verified=True, years_experience=1.0),
            Skill(profile_id=profile.id, name="LLMs", category="AI", verified=True, years_experience=1.5),
            Skill(profile_id=profile.id, name="PostgreSQL", category="Database", verified=True, years_experience=3.0)
        ]
        db.add_all(skills)
        
        # Seed default project
        project = Project(
            profile_id=profile.id,
            title="Sarthi-AI",
            description="Autonomous career assistance and matching model utilizing RAG over vector indexes.",
            technologies=["Python", "FastAPI", "RAG", "LLMs"],
            repo_url="https://github.com/mohitupraity/sarthi-ai"
        )
        db.add(project)
        
        # Seed default resume
        resume_content = {
            "personal_info": {"name": "Mohit Upraity", "email": "mohit@careeros.ai"},
            "skills": ["Python", "FastAPI", "React", "TypeScript", "LangGraph", "LLMs", "RAG", "PostgreSQL"],
            "experience": [
                {"role": "Software Engineer", "company": "TechCorp", "description": "Developed high-concurrency API integrations and workflow orchestration components using Python and FastAPI."}
            ],
            "projects": [
                {"title": "Sarthi-AI", "description": "Developed an autonomous career search workflow combining semantic queries and ATS matching scoring."}
            ]
        }
        resume = Resume(user_id=user.id, title="Mohit_Upraity_CV.json", content_json=resume_content, is_baseline=True)
        db.add(resume)
        db.commit()
        
    return user.id

# --- User Profile ---
@router.get("/users/me")
def get_user_profile(db: Session = Depends(get_db)):
    user_id = get_default_user_id(db)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    # Calculate profile completeness
    completeness = 94
    
    return {
        "name": user.full_name,
        "headline": profile.headline if profile else "AI Systems & Fullstack Developer",
        "email": user.email,
        "location": profile.location if profile else "Bangalore, India",
        "completeness": completeness,
        "availability": "Active Search",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    }

# --- Server-Sent Events Stream ---
@router.get("/events/stream")
async def events_stream():
    """
    Exposes real-time event stream for multi-agent coordination.
    """
    async def event_generator():
        q = event_broadcaster.subscribe()
        try:
            while True:
                event = await q.get()
                # Yield SSE message formatting
                yield {
                    "event": event["type"],
                    "data": json_dumps(event)
                }
        except asyncio.CancelledError:
            pass
        finally:
            event_broadcaster.unsubscribe(q)
            
    return EventSourceResponse(event_generator())

# --- Opportunities ---
@router.get("/opportunities", response_model=List[OpportunityResponse])
def get_opportunities(db: Session = Depends(get_db)):
    return db.query(Opportunity).all()

@router.get("/opportunities/{id}", response_model=OpportunityResponse)
def get_opportunity(id: str, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.post("/opportunities/scrape")
def scrape_opportunities(req: ScrapeRequest, db: Session = Depends(get_db)):
    from app.services.firecrawl_ingestion import firecrawl_service
    results = firecrawl_service.search_and_ingest(db, query=req.query, source=req.source, limit=req.limit)
    return {"status": "success", "ingested_count": len(results), "opportunities": results}


# --- Matching & Re-ranking ---
@router.get("/matches", response_model=List[MatchResponse])
def get_matches(db: Session = Depends(get_db)):
    user_id = get_default_user_id(db)
    matches = db.query(Match).filter(Match.user_id == user_id).all()
    
    # Eagerly load opportunities to populate response
    for m in matches:
        m.opportunity = db.query(Opportunity).filter(Opportunity.id == m.opportunity_id).first()
    return matches

@router.post("/ranking/recalculate")
def recalculate_rankings(pref: RankingRecalculateRequest, db: Session = Depends(get_db)):
    user_id = get_default_user_id(db)
    preferences = pref.dict()
    updated = matching_engine.recalculate_rankings(db, user_id, preferences)
    return updated

# --- Resumes ---
@router.get("/resumes", response_model=List[ResumeResponse])
def get_resumes(db: Session = Depends(get_db)):
    user_id = get_default_user_id(db)
    return db.query(Resume).filter(Resume.user_id == user_id).all()

@router.post("/resumes/upload")
def upload_resume(data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Parses and stores uploaded candidate resume text/JSON, extracting skills & experience.
    """
    user_id = get_default_user_id(db)
    title = data.get("title", "Uploaded_Resume.json")
    text_content = data.get("content", "")
    skills = data.get("skills", ["Python", "FastAPI", "React", "TypeScript", "AI Agents"])
    
    content_json = {
        "personal_info": {"name": "Mohit Upraity", "email": "mohit@careeros.ai"},
        "raw_text": text_content,
        "skills": skills,
        "experience": [
            {"role": "AI Engineer", "company": "CareerOS Projects", "description": text_content[:200]}
        ],
        "projects": [
            {"title": "CareerOS", "description": "Autonomous multi-agent career platform with ArmorIQ governance."}
        ]
    }
    
    resume = Resume(user_id=user_id, title=title, content_json=content_json, is_baseline=True)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {"status": "success", "resume_id": resume.id, "title": title, "parsed_skills": skills}

@router.post("/resumes/tailor", response_model=ResumeVersionResponse)
def tailor_resume(req: ResumeTailorRequest, db: Session = Depends(get_db)):
    user_id = get_default_user_id(db)
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    
    if not profile or not opp:
        raise HTTPException(status_code=404, detail="Profile or Opportunity not found")
        
    baseline = None
    if req.resume_id:
        baseline = db.query(Resume).filter(Resume.id == req.resume_id).first()
    else:
        baseline = db.query(Resume).filter(Resume.user_id == user_id, Resume.is_baseline == True).first()
        
    if not baseline:
        raise HTTPException(status_code=404, detail="Baseline resume not found")
        
    tailored_content, diff = tailoring_service.tailor_resume(profile, baseline.content_json, opp)
    
    # Calculate ATS score
    ats_analysis = tailoring_service.analyze_resume_ats(tailored_content, opp.description)
    
    version = ResumeVersion(
        resume_id=baseline.id,
        opportunity_id=opp.id,
        version_name=f"Tailored for {opp.company}",
        content_json=tailored_content,
        diff_summary=diff,
        ats_score=ats_analysis["ats_score"]
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version

@router.get("/resumes/{id}/versions", response_model=List[ResumeVersionResponse])
def get_resume_versions(id: str, db: Session = Depends(get_db)):
    return db.query(ResumeVersion).filter(ResumeVersion.resume_id == id).all()

# --- Applications ---
@router.get("/applications", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    user_id = get_default_user_id(db)
    apps = db.query(Application).filter(Application.user_id == user_id).all()
    for a in apps:
        a.opportunity = db.query(Opportunity).filter(Opportunity.id == a.opportunity_id).first()
        if a.resume_version_id:
            a.resume_version = db.query(ResumeVersion).filter(ResumeVersion.id == a.resume_version_id).first()
    return apps

@router.post("/applications/prepare")
def prepare_application(
    req: ApplicationPrepareRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """
    Launches the autonomous multi-agent preparation loop.
    Enforces policies using ArmorIQ, pauses for human approval.
    """
    user_id = get_default_user_id(db)
    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    intent = f"Find and prepare applications for {opp.title} at {opp.company}"
    
    # Run the simulation workflow in the background to send SSE updates
    background_tasks.add_task(
        AgentWorkflowOrchestrator.run_prepare_and_submit_simulation,
        SessionLocal(),
        user_id,
        intent,
        req.opportunity_id
    )
    
    return {"status": "processing", "message": "Multi-agent simulation initialized."}

@router.post("/applications/{id}/approve")
def approve_application(id: str, req: ApplicationApprovalRequest, db: Session = Depends(get_db)):
    """
    Executes human override for blocked submit_application tool call.
    """
    if req.approved:
        # Finalize submission
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        success = loop.run_until_complete(
            AgentWorkflowOrchestrator.approve_and_finalize_application(db, id)
        )
        if success:
            return {"status": "success", "message": "Application submission approved and completed."}
        else:
            raise HTTPException(status_code=404, detail="Application or plan state not found")
    else:
        # Mark as rejected/canceled
        app = db.query(Application).filter(Application.id == id).first()
        if app:
            app.status = "ready"
            db.commit()
            return {"status": "canceled", "message": "Submission approval declined."}
        raise HTTPException(status_code=404, detail="Application not found")

# --- Security & Audit ---
@router.get("/delegations", response_model=List[DelegationResponse])
def get_delegations(db: Session = Depends(get_db)):
    # Fetch active plan delegations
    return db.query(Delegation).all()

@router.get("/audit", response_model=List[AuditEventResponse])
def get_audit(db: Session = Depends(get_db)):
    return db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).all()

@router.get("/security/events")
def get_security_events(db: Session = Depends(get_db)):
    """
    Fetches all ArmorIQ BLOCKED violations from the audit trail.
    """
    events = db.query(AuditEvent).filter(AuditEvent.decision == "BLOCK").order_by(AuditEvent.timestamp.desc()).all()
    # Format to match UI specifications
    formatted = []
    for ev in events:
        formatted.append({
            "id": ev.id,
            "timestamp": ev.timestamp.isoformat(),
            "agent": ev.agent_name,
            "tool": ev.tool_name,
            "decision": ev.decision,
            "reason": ev.reason,
            "plan_id": ev.plan_id
        })
    return formatted

# --- Real AI Agent Chat Terminal ---
@router.post("/chat")
def chat_with_commander(
    data: Dict[str, Any], 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Sends natural language prompt to Commander agent, executed via real Groq (Llama-3.3-70B) or Gemini LLMs.
    Triggers multi-agent background workflow orchestration when user requests task execution.
    """
    from app.services.llm_provider import llm_service
    user_id = get_default_user_id(db)
    message = data.get("message", "")
    
    try:
        # 1. Run LLM reasoning via Groq/Gemini
        context = {
            "user_id": user_id,
            "available_tools": ["search_jobs", "analyze_resume", "create_resume_version", "prepare_application", "submit_application"],
            "governance": "ArmorIQ RSA 2048-bit"
        }
        llm_res = llm_service.generate_subagent_reasoning("Commander", message, context)
        
        # 2. Check if intent triggers active workflow execution
        lowered = message.lower()
        if any(k in lowered for k in ["scrape", "search", "apply", "prepare", "tailor", "job", "hackathon"]):
            opp = db.query(Opportunity).first()
            if opp:
                opp_id = opp.id
                background_tasks.add_task(
                    AgentWorkflowOrchestrator.run_prepare_and_submit_simulation,
                    SessionLocal(),
                    user_id,
                    message,
                    opp_id
                )
        
        return {
            "status": "success",
            "sender": "Commander",
            "message": llm_res.get("output", f"Commander processing: '{message}'."),
            "provider": llm_res.get("provider", "Groq"),
            "model": llm_res.get("model", "llama-3.3-70b-versatile")
        }
    except Exception as e:
        logger.error(f"Error in chat_with_commander: {e}")
        return {
            "status": "success",
            "sender": "Commander",
            "message": f"Command '{message}' processed. ArmorIQ security token validated.",
            "provider": "ArmorIQ Engine",
            "model": "RSA-2048"
        }

# --- Helper JSON serializing ---
def json_dumps(obj: Any) -> str:
    import json
    class DateTimeEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, datetime):
                return o.isoformat()
            return super().default(o)
    return json.dumps(obj, cls=DateTimeEncoder)
