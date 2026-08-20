import uuid
from datetime import datetime
from sqlalchemy import (
    Column, 
    String, 
    Boolean, 
    Text, 
    DateTime, 
    Float, 
    ForeignKey, 
    JSON, 
    Numeric
)
from sqlalchemy.orm import relationship
from app.database import Base

# Helper to generate UUID string
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    plans = relationship("Plan", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    headline = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    remote_preference = Column(String(50), nullable=True) # e.g. "remote", "hybrid", "onsite"
    availability_status = Column(String(50), nullable=True) # e.g. "actively looking", "open", "unavailable"
    embedding = Column(JSON, nullable=True) # List of floats representing vector embedding (1536 dim)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="profile")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True) # e.g. "Frontend", "Backend", "ML"
    verified = Column(Boolean, default=True)
    years_experience = Column(Float, nullable=True)
    
    # Relationships
    profile = relationship("Profile", back_populates="skills")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, nullable=True) # List of strings
    repo_url = Column(Text, nullable=True)
    demo_url = Column(Text, nullable=True)
    
    # Relationships
    profile = relationship("Profile", back_populates="projects")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False) # structured resume object
    is_baseline = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"))
    opportunity_id = Column(String(36), nullable=True)
    version_name = Column(String(100), nullable=False)
    content_json = Column(JSON, nullable=False)
    diff_summary = Column(JSON, nullable=True) # diff compared to baseline
    ats_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    resume = relationship("Resume", back_populates="versions")
    applications = relationship("Application", back_populates="resume_version")

class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # job, internship, hackathon, competition
    location = Column(String(255), nullable=True)
    is_remote = Column(Boolean, default=False)
    salary_range = Column(String(100), nullable=True)
    deadline = Column(DateTime, nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=True) # List of strings
    embedding = Column(JSON, nullable=True) # Vector embedding list
    source_url = Column(Text, unique=True, nullable=False)
    posted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    matches = relationship("Match", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"))
    overall_score = Column(Float, nullable=False)
    ats_score = Column(Float, nullable=True)
    skill_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)
    breakdown_json = Column(JSON, nullable=True) # detailed scores
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="matches")
    opportunity = relationship("Opportunity", back_populates="matches")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"))
    status = Column(String(50), nullable=False) # discovered, ready, approval_required, submitted, rejected
    prepared_answers = Column(JSON, nullable=True) # question-answer dictionary
    resume_version_id = Column(String(36), ForeignKey("resume_versions.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")
    resume_version = relationship("ResumeVersion", back_populates="applications")

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    intent = Column(Text, nullable=False)
    status = Column(String(50), nullable=False) # active, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="plans")
    delegations = relationship("Delegation", back_populates="plan", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="plan")

class Delegation(Base):
    __tablename__ = "delegations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    plan_id = Column(String(36), ForeignKey("plans.id", ondelete="CASCADE"))
    parent_agent = Column(String(100), nullable=False)
    child_agent = Column(String(100), nullable=False)
    allowed_scopes = Column(JSON, nullable=False) # list of string actions
    delegation_token = Column(String(512), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    
    # Relationships
    plan = relationship("Plan", back_populates="delegations")
    audit_events = relationship("AuditEvent", back_populates="delegation")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    plan_id = Column(String(36), ForeignKey("plans.id", ondelete="SET NULL"), nullable=True)
    delegation_id = Column(String(36), ForeignKey("delegations.id", ondelete="SET NULL"), nullable=True)
    agent_name = Column(String(100), nullable=False)
    tool_name = Column(String(100), nullable=False)
    arguments = Column(JSON, nullable=True)
    decision = Column(String(20), nullable=False) # ALLOW, BLOCK
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plan = relationship("Plan", back_populates="audit_events")
    delegation = relationship("Delegation", back_populates="audit_events")
