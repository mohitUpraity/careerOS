from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Common Mixins ---
class DateTimeMixin:
    created_at: datetime
    
# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    verified: bool = True
    years_experience: Optional[float] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: str
    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    class Config:
        from_attributes = True

# --- Profile Schemas ---
class ProfileBase(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    remote_preference: Optional[str] = None
    availability_status: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    skills: List[SkillResponse] = []
    projects: List[ProjectResponse] = []
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    profile: Optional[ProfileResponse] = None
    class Config:
        from_attributes = True

# --- Opportunity Schemas ---
class OpportunityBase(BaseModel):
    title: str
    company: str
    type: str  # job, internship, hackathon, competition
    location: Optional[str] = None
    is_remote: bool = False
    salary_range: Optional[str] = None
    deadline: Optional[datetime] = None
    description: str
    requirements: List[str] = []
    source_url: str

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityResponse(OpportunityBase):
    id: str
    posted_at: datetime
    class Config:
        from_attributes = True

class OpportunitySearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

# --- Resume Schemas ---
class ResumeBase(BaseModel):
    title: str
    content_json: Dict[str, Any]
    is_baseline: bool = False

class ResumeCreate(ResumeBase):
    pass

class ResumeResponse(ResumeBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    opportunity_id: Optional[str] = None
    version_name: str
    content_json: Dict[str, Any]
    diff_summary: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ResumeTailorRequest(BaseModel):
    opportunity_id: str
    resume_id: Optional[str] = None # defaults to baseline

# --- Match & Ranking Schemas ---
class MatchResponse(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    overall_score: float
    ats_score: Optional[float] = None
    skill_score: Optional[float] = None
    experience_score: Optional[float] = None
    breakdown_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    opportunity: Optional[OpportunityResponse] = None
    class Config:
        from_attributes = True

class RankingRecalculateRequest(BaseModel):
    remote_priority: float = 0.0 # slider: -1.0 to 1.0 (or 0 to 1)
    salary_priority: float = 0.0
    brand_priority: float = 0.0
    learning_priority: float = 0.0
    deadline_urgency: float = 0.0
    ai_relevance: float = 0.0

# --- Application Schemas ---
class ApplicationBase(BaseModel):
    status: str
    prepared_answers: Optional[Dict[str, Any]] = None

class ApplicationCreate(ApplicationBase):
    opportunity_id: str

class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    opportunity_id: str
    resume_version_id: Optional[str] = None
    created_at: datetime
    opportunity: Optional[OpportunityResponse] = None
    resume_version: Optional[ResumeVersionResponse] = None
    class Config:
        from_attributes = True

class ApplicationPrepareRequest(BaseModel):
    opportunity_id: str

class ApplicationApprovalRequest(BaseModel):
    approved: bool

# --- Delegation & Security Schemas ---
class DelegationBase(BaseModel):
    parent_agent: str
    child_agent: str
    allowed_scopes: List[str]
    expires_at: datetime

class DelegationResponse(DelegationBase):
    id: str
    plan_id: str
    delegation_token: str
    class Config:
        from_attributes = True

class AuditEventResponse(BaseModel):
    id: str
    plan_id: Optional[str] = None
    delegation_id: Optional[str] = None
    agent_name: str
    tool_name: str
    arguments: Optional[Dict[str, Any]] = None
    decision: str
    reason: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True

# --- Agent Activity Log Schema ---
class AgentActivityLog(BaseModel):
    timestamp: str
    agent: str
    action: str
    status: str # ALLOWED, BLOCKED, RUNNING, PENDING
    plan_id: Optional[str] = None

# --- Scrape Schemas ---
class ScrapeRequest(BaseModel):
    query: str = "AI Engineer"
    source: str = "all" # unstop, linkedin, indeed, all
    limit: int = 5

