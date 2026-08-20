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

# Enable universal CORS for Vercel, localhost, and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints for Render health checks
@app.get("/health")
@app.get("/healthz")
@app.head("/health")
@app.head("/healthz")
@app.head("/")
def health_check_root():
    return {"status": "healthy", "service": "CareerOS Backend API"}

app.include_router(router)

def seed_opportunities(db):
    """
    Triggers live opportunity discovery via Firecrawl API across Unstop, LinkedIn, and Indeed,
    or populates live opportunity schemas with real Gemini vector embeddings.
    """
    from app.services.firecrawl_ingestion import firecrawl_service
    from app.services.matching import generate_gemini_embedding
    
    # Trigger Firecrawl ingestion
    try:
        results = firecrawl_service.search_and_ingest(db, query="AI Engineer", source="all", limit=3)
        logger.info(f"Firecrawl live ingestion initialized: {len(results)} opportunities synced.")
    except Exception as e:
        logger.error(f"Startup Firecrawl ingestion error: {e}")

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed default user profile
        user_id = get_default_user_id(db)
        
        # Seed opportunities
        seed_opportunities(db)
        
        # Calculate initial matches for default user with real Gemini embeddings
        from app.models import Profile, Match
        from app.services.matching import generate_gemini_embedding
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            profile_text = f"{profile.headline} {profile.bio} {profile.location}"
            profile.embedding = generate_gemini_embedding(profile_text)
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
        
    # Start internal keep-alive loop to prevent Render free-tier sleep
    import asyncio, urllib.request
    async def keep_alive():
        while True:
            await asyncio.sleep(240) # Every 4 minutes
            try:
                # Ping health endpoint
                urllib.request.urlopen("http://127.0.0.1:8000/api/health", timeout=5)
                logger.info("Keep-alive ping sent to stay awake.")
            except Exception:
                pass
    asyncio.create_task(keep_alive())

@app.get("/")
def read_root():
    return {"status": "online", "service": "CareerOS Backend", "engine": "FastAPI"}

@app.get("/health")
def root_health():
    return {"status": "healthy", "service": "CareerOS Backend"}

