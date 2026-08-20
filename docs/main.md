Yes. I’d structure this as a real product build, not just a hackathon UI.
Your uploaded Problem 2 requires a multi-agent system with explicit delegation, separate agent clients/keypairs, each sub-agent having its own MCP tool, and at least one demonstrated scope violation.
Below is the build plan I recommend.
1. First: what you are actually building
Product name — working title
CareerOS
Autonomous Career Intelligence & Application Platform
The product has two layers:
Layer A — Career automation
Jobs / Internships / Competitions
            ↓
      Discovery Agents
            ↓
      Eligibility Filter
            ↓
       ATS Analysis
            ↓
       Match Scoring
            ↓
       Re-ranking
            ↓
     Resume Tailoring
            ↓
   Application Preparation
Layer B — Trust / security
                    ArmorIQ
                       │
                User Intent
                       ↓
                 Commander
                       ↓
                 Delegation
                       ↓
             Specialized Agents
                       ↓
                MCP Tool Call
                       ↓
               Authorization
                  /        \
              ALLOW        BLOCK
                │            │
                ↓            ↓
             Execute       Audit
That second layer is what makes this a Problem 2 submission, rather than merely a career platform.
2. FRONTEND — ANTIGRAVITY PROMPT
Give Antigravity this prompt first.
Don't ask it to build the backend yet.
CareerOS — Frontend Product Build Specification
You are building the frontend of CareerOS, an AI-powered autonomous career intelligence and application platform.
This is NOT a generic job board.

CareerOS is a multi-agent operations platform where AI agents:

Discover jobs, internships, hackathons and competitions.
Analyze opportunity requirements.
Analyze the user's resume.
Calculate ATS compatibility.
Calculate candidate/opportunity match scores.
Rank and re-rank opportunities according to user preferences.
Generate tailored resume versions using only truthful evidence from the user's profile.
Prepare applications.
Request authorization when an action exceeds an agent's delegated authority.
Display a complete visual audit trail of agent delegation and tool execution.
The platform is being built for the ArmorIQ Problem 2 track: "Who authorized that?"
The frontend must therefore make agent delegation, authorization, tool execution, blocked actions, and audit trails first-class UI concepts.

1. TECHNICAL FRONTEND STACK
Use:
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Lucide React
Framer Motion
React Router
TanStack Query
Zustand
React Hook Form
Zod
Recharts
React Flow / XYFlow
date-fns
Do NOT introduce another frontend framework.
Use strict TypeScript.

Use reusable components rather than duplicating UI.

The frontend should initially use realistic mocked API data behind clean service interfaces so the backend can later replace the mocks without requiring UI rewrites.

2. DESIGN DIRECTION
Create a premium AI operations-center interface.
Visual references:

modern AI infrastructure dashboards
Linear
Vercel
Stripe Dashboard
Raycast
modern SOC/security dashboards
high-end developer tools
Avoid:
generic SaaS gradients
excessive glassmorphism
cartoon AI robots
giant hero sections
generic job-board cards
excessive rounded cards
unnecessary animations
The product should feel like:
"Mission Control for an autonomous AI career system."
Use a dark-first interface.
Primary visual language:

near-black background
charcoal panels
subtle borders
white/gray typography
restrained accent color
green = authorized/success
amber = pending
red = blocked/security violation
blue/purple = agent activity
Use color semantically rather than decoratively.
3. APPLICATION STRUCTURE
Create the following routes:
/dashboard

/opportunities

/opportunities/

/competitions

/resume

/resume/

/matches

/applications

/applications/

/agents

/agents/

/delegations

/audit

/security

/settings

4. GLOBAL APPLICATION SHELL
Build a persistent application shell.
Desktop layout:

LEFT SIDEBAR
CENTER CONTENT
OPTIONAL RIGHT ACTIVITY PANEL

Sidebar:

CareerOS logo

COMMAND CENTER

Dashboard
Opportunities
Competitions
Matches
Resume Lab
Applications
AI OPERATIONS
Agent Network
Delegations
Execution Logs
SECURITY
ArmorIQ
Security Events
Audit Trail
SYSTEM
Settings
At the bottom:
User avatar
Name
Profile completeness
Availability status

Sidebar should support collapsed mode.

5. TOP COMMAND BAR
Create a global command/search bar.
Placeholder:

"Ask CareerOS anything..."

Examples:

"Find remote AI internships"

"Show competitions closing this week"

"Prioritize GenAI roles"

"Re-rank my opportunities for Bangalore"

"Analyze my resume against the top 10 opportunities"

Use Cmd/Ctrl + K.

The command interface should feel like an AI command center rather than a normal search box.

6. DASHBOARD
The dashboard is the main product screen.
Top section:

Greeting:

"Good evening, Mohit."

Subtitle:

"Your career operations are running autonomously."

Then show:

OPPORTUNITIES FOUND
MATCHED
HIGH-CONFIDENCE
APPLICATIONS READY
SECURITY EVENTS

Example:

127
opportunities discovered

43
strong matches

12
high-confidence matches

5
applications ready

1
blocked action

7. LIVE AGENT ACTIVITY
Create a prominent "Agent Activity" panel.
Display live events such as:

18:42:01
Discovery Agent
searched 127 opportunities

18:42:04
ATS Agent
analyzed resume against 43 roles

18:42:07
Ranking Agent
re-ranked 43 opportunities

18:42:10
Resume Agent
created tailored resume v4

18:42:12
Application Agent
requested submit_application

18:42:12
ArmorIQ
BLOCKED — outside delegated authority

Use animated event insertion.

Do not fake constant activity.

Create an activity stream component that can later consume WebSocket/SSE events.

8. AGENT NETWORK VISUALIZATION
Create a large interactive React Flow visualization.
Nodes:

Career Commander

Discovery Agent

ATS Agent

Matching Agent

Ranking Agent

Resume Agent

Application Agent

ArmorIQ Policy Layer

MCP Tools

Example graph:

User
↓
Career Commander
↓
├── Discovery Agent → Opportunity MCP
├── ATS Agent → Resume MCP
├── Matching Agent → Matching MCP
├── Ranking Agent → Ranking MCP
├── Resume Agent → Resume MCP
└── Application Agent → Application MCP

ArmorIQ should appear as the security layer around agent-to-tool execution.

Each node should show:

Agent name
Status
Current task
Authority level
Last action

Statuses:

IDLE
RUNNING
WAITING
BLOCKED
COMPLETED

Animate edges while an agent is executing.

9. OPPORTUNITIES PAGE
Create an advanced opportunity intelligence interface.
Tabs:

All
Jobs
Internships
Competitions
Research
Hackathons

Filters:

Role
Skills
Location
Remote
Experience
Salary
Deadline
Company
Opportunity type
Match score

Each opportunity card should show:

Company
Role
Location
Type
Deadline
Match %
ATS %
Skill match
Eligibility
Source
Posted date

Example:

AI/ML Engineer Intern

NVIDIA

Remote / Bangalore

94% Match

ATS: 91

Skills: 96

Eligibility: 100

Deadline: 6 days

Buttons:

View Analysis
Tailor Resume
Prepare Application

10. OPPORTUNITY DETAIL PAGE
Design this as an intelligence report.
Header:

Company
Role
Match score
Apply status

Main sections:

Opportunity Overview
Description
Requirements
Responsibilities
Eligibility
Compensation
Deadline
Candidate Fit
Overall Match: 94%
Breakdown:

Skills Match 96%
Experience Match 88%
Projects Match 94%
Education Match 100%
Domain Match 91%
Eligibility 100%

Use a radial or horizontal visualization.

Skill Analysis
MATCHED
Python
RAG
LLMs
FastAPI
LangGraph

PARTIAL

AWS
Docker

MISSING

Kubernetes

IMPORTANT:

Never tell the user they have a skill unless that skill exists in their verified profile/resume.

11. ATS ANALYSIS
Create a dedicated ATS panel.
Display:

ATS SCORE
91 / 100

Then:

Keyword Coverage
92%

Semantic Match
94%

Experience Evidence
87%

Project Evidence
95%

Formatting
98%

Explain every score.

Example:

"Your resume demonstrates RAG through the Sarthi-AI project."

"FastAPI appears in your technical experience."

"Your resume does not currently provide evidence for Kubernetes."

Provide:

"Improve Match"

button.

12. MATCHING ENGINE VISUALIZATION
Create a section showing:
USER PROFILE
↓
JOB REQUIREMENTS
↓
SEMANTIC MATCH
↓
EVIDENCE MATCH
↓
FINAL SCORE

Show a score formula visually.

Example:

Skills 30%
Experience 20%
Projects 15%
ATS 10%
Eligibility 10%
Location 5%
Domain 5%
Deadline 5%

Final:

94 / 100

13. RE-RANKING EXPERIENCE
Create a dedicated "Ranking Lab".
Show:

CURRENT RANKING

NVIDIA — 94
Microsoft — 91
Google — 88
XYZ AI — 83
Then provide preference controls:
Remote priority
Salary priority
Brand priority
Learning priority
Deadline urgency
Location preference
AI/ML relevance

When a preference changes, animate the ranking.

Example:

Before:

NVIDIA 94
Microsoft 91
Google 88

After "Remote priority +50%":

XYZ AI 93 ↑
Microsoft 90
NVIDIA 87 ↓

Show WHY each opportunity moved.

Example:

"Moved +7 because remote compatibility increased."

This is important.

The ranking system must be explainable.

14. RESUME LAB
Create a premium resume management interface.
Sections:

Current Resume

Resume Versions

Tailored Resumes

Resume Analytics

Show resume:

Name
Last updated
ATS baseline
Profile completeness

Create a "Tailor Resume" workflow.

Step 1:

Select opportunity.

Step 2:

Analyze requirements.

Step 3:

Find matching evidence.

Step 4:

Generate tailored version.

Step 5:

Compare changes.

Step 6:

Save version.

15. RESUME DIFF VIEW
Create a side-by-side diff.
LEFT:

Original Resume

RIGHT:

Tailored Resume

Highlight:

Added
Modified
Removed

Every change should show an explanation.

Example:

"Moved RAG project higher because the opportunity explicitly requires retrieval systems."

"Reworded project description to surface existing Python experience."

Never allow the UI to imply fabricated experience.

Show:

"Verified evidence"

for claims grounded in the user's profile.

16. APPLICATIONS PAGE
Create an application pipeline similar to a professional operations board.
Columns:

Discovered

Analyzed

Shortlisted

Resume Ready

Application Ready

Approval Required

Submitted

Interview

Rejected

Offer

Cards should show:

Company
Role
Match %
Resume version
Application status
Last action

17. APPLICATION DETAIL
Display:
Opportunity

Candidate Fit

Resume Version

Application Data

Agent Activity

Authorization

Audit History

Show:

Application prepared

✓ Profile loaded
✓ Resume selected
✓ Questions generated
✓ Answers prepared

Then:

"Submission requires authorization."

Button:

REQUEST APPROVAL

Do NOT automatically submit in the frontend.

18. DELEGATION CENTER
This is one of the most important pages for the competition.
Create a visual delegation tree.

Example:

USER

"Find and prepare applications for AI internships."

↓

CAREER COMMANDER

Authority:
Search
Analyze
Rank
Prepare

↓

DISCOVERY AGENT

Delegated authority:
search_jobs
get_job_details

↓

ATS AGENT

Delegated authority:
get_resume
score_resume

↓

RESUME AGENT

Delegated authority:
get_resume
create_resume_version

↓

APPLICATION AGENT

Delegated authority:
prepare_application

NOT AUTHORIZED:

submit_application

19. BLOCKED ACTION EXPERIENCE
Make this visually impressive.
When an unauthorized action occurs:

Show a security modal/panel:

AUTHORITY VIOLATION

Application Agent attempted:

submit_application()

Delegated scope:

prepare_application

Decision:

BLOCKED

Reason:

The requested action was not included in the agent's delegated authority.

Then show:

Parent:
Career Commander

Agent:
Application Agent

Tool:
Application MCP

Action:
submit_application

Status:
BLOCKED

Chain:

User
↓
Commander
↓
Application Agent
↓
submit_application
↓
ArmorIQ
↓
BLOCKED

Buttons:

View Delegation

View Plan

View Audit Event

Request Human Approval

20. ARMORIQ SECURITY DASHBOARD
Create:
Security Overview

Total Agent Actions
Allowed
Blocked
Pending
Expired Delegations

Security Events

Show timeline:

AUTHORIZED
AUTHORIZED
AUTHORIZED
BLOCKED
AUTHORIZED

Each event should include:

timestamp
agent
parent
tool
action
decision
delegation ID
plan ID

21. AUDIT TRAIL
Create an immutable-looking timeline.
Example:

PLAN CREATED

Plan ID:
PLAN-8F91

User intent:
"Find and prepare AI internship applications."

↓

DELEGATION CREATED

Commander → Discovery Agent

Scope:
search/read

↓

TOOL INVOKED

Discovery Agent
search_jobs()

ALLOW

↓

DELEGATION CREATED

Commander → ATS Agent

Scope:
resume.read
resume.score

↓

TOOL INVOKED

ATS Agent
score_resume()

ALLOW

↓

VIOLATION

Application Agent
submit_application()

BLOCK

Every event should be expandable.

22. AGENT DETAIL PAGE
For each agent show:
Agent name

Status

Agent ID

Public key

Parent agent

Current task

Delegated scope

MCP server

Available tools

Recent actions

Security events

Delegation history

Example:

APPLICATION AGENT

Status:
WAITING

Parent:
Career Commander

Authority:

prepare_application
get_application_questions

Not authorized:

submit_application
send_email
delete_application

23. SECURITY STATES
Use consistent states everywhere:
GREEN:
AUTHORIZED

AMBER:
PENDING APPROVAL

RED:
BLOCKED

BLUE:
RUNNING

GRAY:
IDLE

24. ANIMATIONS
Use Framer Motion carefully.
Animate:

agent status transitions
activity feed
ranking changes
delegation creation
blocked action
audit timeline
score updates
graph edges
Do NOT animate everything.
Performance matters.

Respect prefers-reduced-motion.

25. RESPONSIVE DESIGN
Primary target:
Desktop 1440px+

Also support:

1280px
1024px
mobile

On mobile:

sidebar becomes drawer

React Flow graph becomes horizontally scrollable or simplified

three-column dashboards become stacked layouts

26. MOCK API CONTRACTS
Create frontend service interfaces.
Example:

GET /api/opportunities

GET /api/opportunities/

GET /api/matches

GET /api/matches/

GET /api/resume

GET /api/resume/

POST /api/resume/tailor

GET /api/applications

GET /api/applications/

GET /api/agents

GET /api/agents/

GET /api/delegations

GET /api/audit

GET /api/security/events

POST /api/approval/

The frontend should use a service layer so replacing mock data with the FastAPI backend requires minimal changes.

27. DATA TYPES
Create TypeScript types for:
User

Profile

Opportunity

Job

Competition

Skill

MatchScore

ATSAnalysis

Resume

ResumeVersion

Application

Agent

Delegation

Tool

ToolInvocation

AuthorizationDecision

AuditEvent

SecurityEvent

AgentActivity

28. DEMO MODE
Build a special demo mode.
Route:

/demo

The demo should simulate:

User intent submitted.
Commander creates plan.
Discovery Agent executes.
ATS Agent executes.
Ranking Agent executes.
Resume Agent creates tailored resume.
Application Agent attempts unauthorized action.
ArmorIQ blocks it.
Dashboard shows the complete chain.
Human approval is clicked.
Agent continues.
The demo must feel like a real live system.
Create a "Run Security Demo" button.

29. IMPORTANT ARCHITECTURAL RULE
Do not put ArmorIQ logic directly into UI components.
Frontend only consumes:

authorization state
delegation state
agent state
audit events

The backend is responsible for actual authorization.

Frontend must never be trusted for security.

30. CODE QUALITY
Use:
reusable components
feature-based folder structure
strict TypeScript
no giant components
no hardcoded repeated data
no duplicated styles
accessible buttons
keyboard navigation
loading states
error states
empty states
skeleton loaders
Create a clean architecture.
Suggested structure:

src/

components/
ui/
layout/
agents/
opportunities/
resume/
applications/
security/
audit/

features/
dashboard/
opportunities/
resume/
matching/
applications/
agents/
security/

pages/

services/

store/

types/

hooks/

lib/

mock/

31. FINAL FRONTEND QUALITY BAR
The finished frontend should look like a production AI operations platform.
It should NOT look like:

a college project
a generic ATS
a basic job scraper
a ChatGPT clone
The first 10 seconds should communicate:
"Multiple AI agents are autonomously operating my career workflow, and every action is governed and auditable."

Build the complete frontend with realistic mock data.

After implementation:

Run the application.
Check all routes.
Fix TypeScript errors.
Fix console errors.
Fix layout overflow.
Verify responsive behavior.
Verify loading/error/empty states.
Verify the demo flow.
Verify the security violation animation.
Verify that all pages are connected through navigation.
Do not stop after creating a static dashboard.
Build the actual interactive frontend experience.
3. Now don't let Antigravity do everything
This is important.
Do NOT immediately ask it to implement backend + agents + ArmorIQ.
Build in this order:
PHASE 1
Frontend

        ↓

PHASE 2
Database + Backend

        ↓

PHASE 3
Opportunity ingestion

        ↓

PHASE 4
ATS + Matching

        ↓

PHASE 5
LangGraph agents

        ↓

PHASE 6
MCP servers

        ↓

PHASE 7
ArmorIQ delegation

        ↓

PHASE 8
Security violation demo

        ↓

PHASE 9
Production deployment
This prevents you from ending up with a beautiful UI and broken agent architecture.
4. STACK — FINAL RECOMMENDATION
Layer	Technology
Frontend	React + TypeScript + Vite
UI	Tailwind + shadcn/ui
Animation	Framer Motion
Graph	React Flow
Charts	Recharts
State	Zustand
Server state	TanStack Query
Forms	React Hook Form + Zod
Backend	Python + FastAPI
Agent orchestration	LangGraph
LLM	Gemini / OpenRouter
Embeddings	BGE / Gemini embeddings
Vector DB	pgvector
Main DB	PostgreSQL
Cache	Redis
Background jobs	Celery / ARQ
Scraping	Playwright
Browser automation	Playwright
Agent protocol	MCP
Security	ArmorIQ SDK
Auth	Better Auth / Clerk / Firebase Auth
Storage	S3-compatible storage
Realtime	WebSockets/SSE
Containers	Docker
Deployment	Vercel + Railway/Render/AWS
Monitoring	Sentry + structured logs
CI/CD	GitHub Actions
One important decision
I would use PostgreSQL + pgvector, not MongoDB, for this project.
You have highly relational entities:
User
 ↓
Resume
 ↓
Skills
 ↓
Opportunity
 ↓
Requirements
 ↓
Match
 ↓
Application
 ↓
Agent
 ↓
Delegation
 ↓
Tool invocation
 ↓
Audit event
Postgres fits this extremely well.
5. PRD
Product Requirements Document
Product
CareerOS
Vision
Create an autonomous career operations platform that continuously discovers opportunities, evaluates candidate fit, optimizes resumes, and prepares applications while ensuring every agent action is explicitly authorized and auditable.
Problem
Job seekers currently have to manually:
find opportunities
        ↓
read JD
        ↓
check eligibility
        ↓
compare with resume
        ↓
calculate fit
        ↓
modify resume
        ↓
apply
        ↓
track applications
The process is repetitive and fragmented.
Meanwhile, multi-agent AI introduces another problem:
When one agent delegates work to another, how do we know what the child agent was actually authorized to do?
This is the central Problem 2 requirement.
6. Product Goal
CareerOS should transform:
"I need to find opportunities"
into:
USER INTENT

      ↓

AUTONOMOUS EXECUTION

      ↓

DISCOVERY

      ↓

ANALYSIS

      ↓

MATCHING

      ↓

RANKING

      ↓

PERSONALIZATION

      ↓

APPLICATION PREPARATION

      ↓

AUTHORIZED EXECUTION
7. Target Users
Primary
Students and early-career engineers.
Secondary
researchers
freelancers
professionals
job switchers
competition-focused developers
8. Core Features
F1 — Opportunity Discovery
System discovers:
jobs
internships
hackathons
competitions
research roles
F2 — Opportunity normalization
Convert different sources into one schema:
title
company
description
skills
location
experience
salary
deadline
eligibility
source
url
type
F3 — Candidate profile
User profile contains:
education
skills
projects
experience
preferences
location
resume
portfolio
github
F4 — ATS analysis
Analyze resume against opportunity.
Output:
ATS score
keyword match
semantic match
experience match
project match
missing requirements
F5 — Opportunity matching
Generate candidate-opportunity score.
F6 — Dynamic re-ranking
User preferences modify ranking.
F7 — Resume tailoring
Generate opportunity-specific resume.
Constraint:
No fabricated qualifications.
F8 — Application preparation
Prepare:
application fields
answers
resume
cover letter
email
F9 — Multi-agent orchestration
Agents operate independently.
F10 — Explicit delegation
Parent agent delegates scoped authority to child agent.
The competition specifically requires this authority chain to be cryptographically traceable.
F11 — Authorization enforcement
Every tool invocation is verified.
F12 — Audit
Record:
who
what
when
why
under whose authority
which delegation
which plan
which tool
decision
9. Non-functional requirements
Security
no frontend authorization
secrets server-side
scoped agent credentials
separate keypairs
immutable audit records
delegation expiration
Separate client/keypairs are explicitly required by the competition rules.
Performance
Target:
Dashboard < 2 sec
Opportunity search < 5 sec
ATS analysis < 10 sec
Ranking < 10 sec
Reliability
Agent failures should not crash the entire workflow.
Use:
retry
timeout
fallback
checkpoint
resume
LangGraph is particularly useful here.
10. TRD
Technical Requirements Document
Architecture
Use:
                         CLIENT
                           │
                    React / Vite
                           │
                     REST + SSE
                           │
                           ▼
                     FastAPI API
                           │
                ┌──────────┴───────────┐
                │                      │
          LangGraph              PostgreSQL
          Commander                  │
                │                  pgvector
                │
        ┌───────┼────────┬──────────┐
        ▼       ▼        ▼          ▼
     Search    ATS    Ranking     Resume
     Agent    Agent    Agent      Agent
        │       │        │          │
        ▼       ▼        ▼          ▼
       MCP     MCP      MCP        MCP
        │       │        │          │
        └───────┴────────┴──────────┘
                       │
                       ▼
                   ArmorIQ
                       │
                 Policy Engine
                       │
               ┌───────┴───────┐
               ▼               ▼
             ALLOW            BLOCK
11. Agent architecture
Commander
Responsibilities:
understand user intent
create plan
delegate
monitor execution
aggregate results
Cannot directly perform every operation.
Discovery Agent
Authority:
search_opportunities
read_opportunity
MCP:
Opportunity MCP
ATS Agent
Authority:
read_resume
analyze_resume
score_resume
MCP:
Resume Analysis MCP
Matching Agent
Authority:
read_profile
read_opportunities
calculate_match
Ranking Agent
Authority:
read_matches
apply_preferences
rank
Resume Agent
Authority:
read_resume
create_resume_version
Application Agent
Authority:
prepare_application
Potential dangerous tools:
submit_application
send_application_email
These are deliberately outside its default delegation.
12. MCP architecture
You can have:
MCP 1
opportunity-mcp
Tools:
search_jobs
search_competitions
get_opportunity
MCP 2
resume-mcp
Tools:
get_resume
analyze_resume
create_resume_version
MCP 3
application-mcp
Tools:
prepare_application
submit_application
send_email
This gives you a clean security boundary.
13. ArmorIQ integration
Your flow should conceptually be:
User Intent
     ↓
capture_plan()
     ↓
Commander
     ↓
delegate()
     ↓
Child Agent
     ↓
invoke()
     ↓
ArmorIQ verification
     ↓
MCP Tool
For example:
Parent:
Commander

Child:
Application Agent

Delegated scope:
prepare_application

Child requests:
submit_application

ArmorIQ:

PLAN SCOPE = prepare_application
REQUEST = submit_application

RESULT = BLOCK
This directly demonstrates the required scope violation. The problem statement requires at least one such violation and says the violation cannot simply be caught by a keyword filter.
14. Database schema
Core tables:
users
profiles
skills
projects
experiences

resumes
resume_versions

opportunities
opportunity_requirements

matches
match_factors
ranking_snapshots

applications
application_events

agents
agent_keys
tools

plans
delegations
tool_invocations

authorization_decisions
audit_events
security_events
Relationships:
users
  │
  ├── profiles
  ├── resumes
  │     └── resume_versions
  │
  ├── matches
  │     └── opportunities
  │
  └── applications
        └── opportunities


plans
  └── delegations
        └── tool_invocations
              └── authorization_decisions
                    └── audit_events
15. Matching algorithm
Don't let the LLM directly decide the final score.
Use a hybrid system.
Stage 1 — Hard filters
eligibility
experience
location
deadline
role type
Stage 2 — Semantic retrieval
Embeddings:
resume embedding
       ↕
job embedding
Stage 3 — Feature scoring
skills
projects
experience
education
domain
preferences
Stage 4 — LLM reasoning
Use LLM for explanation and nuanced evidence extraction.
Stage 5 — deterministic score
Final Score
This makes the system reproducible.
16. Scraping architecture
Don't scrape everything blindly.
Use:
Scheduler
   ↓
Source connectors
   ↓
Fetcher
   ↓
Parser
   ↓
Normalizer
   ↓
Deduplicator
   ↓
Postgres
   ↓
Embedding
For sites where automation is permitted, Playwright can handle dynamic pages.
Prefer:
official APIs
RSS
public feeds
structured pages
before browser scraping.
Also respect each site's terms, robots directives, rate limits, and access restrictions.
17. Background architecture
Opportunity discovery should NOT happen inside the HTTP request.
Use:
Scheduler
   ↓
Redis Queue
   ↓
Worker
   ↓
Scraper
   ↓
Normalizer
   ↓
DB
Example:
Every 6 hours

        ↓

Job discovery

        ↓

Competition discovery

        ↓

Deduplicate

        ↓

Embedding

        ↓

Match against active users

        ↓

Update rankings
18. Realtime architecture
Use SSE initially.
Backend:
POST /agent/run
Then:
GET /agent/events/stream
Events:
agent.started
agent.delegated
tool.invoked
tool.allowed
tool.blocked
agent.completed
approval.required
Frontend listens and updates the operations center.
19. API design
Opportunities
GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities/search
Matching
POST   /api/matches/analyze
GET    /api/matches
GET    /api/matches/:id
POST   /api/ranking/recalculate
Resume
GET    /api/resumes
POST   /api/resumes
POST   /api/resumes/analyze
POST   /api/resumes/tailor
GET    /api/resumes/:id/versions
Applications
GET    /api/applications
POST   /api/applications/prepare
POST   /api/applications/:id/approve
Agents
GET /api/agents
GET /api/agents/:id
GET /api/agents/:id/actions
Security
GET /api/delegations
GET /api/audit
GET /api/security/events
POST /api/approvals/:id
20. What you should do NEXT
Don't start by building 100 features.
STEP 1 — Build frontend
Give Antigravity the prompt above.
Get this working:
Dashboard
Opportunities
Opportunity Analysis
ATS
Resume Lab
Applications
Agent Network
Delegations
Audit
Security
Demo
Use mocks.
STEP 2 — Create backend repository
I'd structure the repo as:
careeros/

├── frontend/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── mcp/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── security/
│   │   └── workers/
│   │
│   └── tests/
│
├── mcp-servers/
│   ├── opportunity/
│   ├── resume/
│   └── application/
│
├── infrastructure/
│   ├── docker/
│   └── migrations/
│
├── docs/
│
└── docker-compose.yml
21. Then build ONE vertical slice
This is the most important engineering advice.
Don't build:
all agents
+
all scrapers
+
all UI
+
all security
simultaneously.
Build this first:
User
 ↓
Commander
 ↓
Discovery Agent
 ↓
Opportunity MCP
 ↓
ArmorIQ
 ↓
search_jobs()
 ↓
Results
Then:
Commander
 ↓
ATS Agent
 ↓
Resume MCP
 ↓
ArmorIQ
 ↓
score_resume()
Then connect them.
22. Then build the actual competition demo
Your minimum viable competition system should be:
User intent
    ↓
Commander
    ↓
Discovery Agent
    ↓
ATS Agent
    ↓
Ranking Agent
    ↓
Resume Agent
    ↓
Application Agent
    ↓
UNAUTHORIZED ACTION
    ↓
ArmorIQ
    ↓
BLOCK
    ↓
Dashboard
    ↓
Human approval
    ↓
CONTINUE
That's your golden path.
Don't add another 20 agents until this works.
23. Your killer scenario
I recommend making the demo around:
"Find and prepare the best AI internships for me."
The system discovers opportunities.
Then it picks:
#1 AI/ML Internship
94% match
ATS agent analyzes it.
Resume agent creates:
Mohit_AI_Internship_v3.pdf
Application agent prepares everything.
Then:
Application Agent
        ↓
"submit_application"
        ↓
ArmorIQ
        ↓
❌ BLOCKED
Why?
Authorized:
prepare_application

Unauthorized:
submit_application
Judge sees the entire delegation chain.
Then you click:
Approve
and the system continues.
That directly demonstrates the "autonomous until it shouldn't" philosophy surrounding the competition's agent-governance requirements, while satisfying the Problem 2 delegation model.
24. One thing I'd change from your original idea
Don't make scraping the centerpiece.
Make this the centerpiece:
Career Intelligence + Agentic Execution + Cryptographic Delegation
Scraping is merely the data ingestion layer.
Your actual competitive differentiation is:
              CAREER INTELLIGENCE
                      +
              MULTI-AGENT SYSTEM
                      +
              REAL MCP TOOLS
                      +
          CRYPTOGRAPHIC DELEGATION
                      +
             SCOPE ENFORCEMENT
                      +
              COMPLETE AUDIT
That gives you something judges can understand in about 30 seconds and something technically deep enough to discuss for 10–15 minutes.