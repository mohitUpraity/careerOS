import os
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import Opportunity
from app.api.routes import router, get_default_user_id
from app.services.matching import matching_engine

logger = logging.getLogger("career_os.main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="CareerOS Backend Server",
    description="Autonomous Career Operations & Cryptographic Governance API",
    version="1.0.0"
)

# Enable CORS for React Dev server (port 5173 / 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

def seed_opportunities(db):
    """
    Seeds initial opportunities if they don't already exist.
    """
    opportunities_data = [
        {
            "title": "AI/ML Engineer Intern",
            "company": "NVIDIA",
            "type": "internship",
            "location": "Bangalore, India",
            "is_remote": False,
            "salary_range": "₹80,000 - ₹1,20,000 / month",
            "deadline": datetime.utcnow() + timedelta(days=6),
            "description": "Join our AI infrastructure team to design, optimize, and evaluate state-of-the-art Deep Learning models. You will construct high-concurrency inference services using Python and FastAPI, integrate retrieval augmented generation (RAG) models, and orchestrate systems with Kubernetes.",
            "requirements": ["Python", "FastAPI", "RAG", "LLMs", "Kubernetes"],
            "source_url": "https://nvidia.wd5.myworkdayjobs.com/NVIDIACareers/job/India-Bangalore/AI-ML-Intern"
        },
        {
            "title": "Research Intern - Generative AI",
            "company": "Microsoft",
            "type": "internship",
            "location": "Remote, India",
            "is_remote": True,
            "salary_range": "₹1,00,000 / month",
            "deadline": datetime.utcnow() + timedelta(days=12),
            "description": "Contribute to Microsoft Research by investigating multi-agent alignment frameworks and agent orchestration graphs. Work closely with researchers using LangGraph and LLM pipelines to construct safe, reliable, and auditable automation scripts.",
            "requirements": ["Python", "LangGraph", "LLMs", "PostgreSQL"],
            "source_url": "https://careers.microsoft.com/us/en/job/genai-research-intern"
        },
        {
            "title": "Software Engineer Intern",
            "company": "Google",
            "type": "internship",
            "location": "Bangalore, India",
            "is_remote": False,
            "salary_range": "₹1,50,000 / month",
            "deadline": datetime.utcnow() + timedelta(days=4),
            "description": "Engineering interns work on Google's core products. We are looking for candidates with experience building web applications in React and TypeScript, integrating databases (SQL), and working with cloud architecture.",
            "requirements": ["Python", "React", "TypeScript", "AWS", "SQL"],
            "source_url": "https://careers.google.com/jobs/results/software-engineer-intern-bangalore"
        }
    ]
    
    for opp_dict in opportunities_data:
        existing = db.query(Opportunity).filter(
            Opportunity.source_url == opp_dict["source_url"]
        ).first()
        
        if not existing:
            opp = Opportunity(**opp_dict)
            # Create a simple mock embedding vector for semantic search tests (1536 dim)
            # Since we're on fallback, a random vector works perfectly
            import random
            opp.embedding = [random.uniform(-0.1, 0.1) for _ in range(1536)]
            
            db.add(opp)
            db.commit()
            db.refresh(opp)
            logger.info(f"Seeded opportunity: {opp.title} at {opp.company}")

@app.on_event("startup")
def on_startup():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed default user profile
        user_id = get_default_user_id(db)
        
        # Seed opportunities
        seed_opportunities(db)
        
        # Calculate initial matches for default user
        from app.models import Profile, Match
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            # Generate mock user embedding matching our profile
            import random
            profile.embedding = [random.uniform(-0.1, 0.1) for _ in range(1536)]
            db.commit()
            
            opportunities = db.query(Opportunity).all()
            for opp in opportunities:
                existing_match = db.query(Match).filter(
                    Match.user_id == user_id, 
                    Match.opportunity_id == opp.id
                ).first()
                
                if not existing_match:
                    score, breakdown = matching_engine.calculate_match_score(db, profile, opp)
                    match = Match(
                        user_id=user_id,
                        opportunity_id=opp.id,
                        overall_score=score,
                        ats_score=breakdown["ats_score"],
                        skill_score=breakdown["skills_score"],
                        experience_score=breakdown["experience_score"],
                        breakdown_json=breakdown
                    )
                    db.add(match)
            db.commit()
            logger.info("Calculated and seeded initial matches.")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "online", "service": "CareerOS Backend", "engine": "FastAPI"}
