# Technical Requirements Document (TRD) — CareerOS

**Product Title:** CareerOS — Technical Specification & Architecture  
**Document Version:** 1.0.0  

---

## 1. System Architecture Overview

CareerOS uses a decoupled multi-agent architecture built on Python (FastAPI + LangGraph), PostgreSQL with `pgvector`, Model Context Protocol (MCP) tool servers, and ArmorIQ policy enforcement.

```
                         CLIENT LAYER
                       (React / TS / Vite)
                                │
                          REST + SSE API
                                │
                                ▼
                       FASTAPI BACKEND
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
      LangGraph Commander                     PostgreSQL DB
             │                                (with pgvector)
             │
     ┌───────┼──────────┬──────────┐
     ▼       ▼          ▼          ▼
  Discovery ATS      Ranking     Resume
  Agent    Agent     Agent       Agent
     │       │          │          │
     ▼       ▼          ▼          ▼
    MCP     MCP        MCP        MCP
     │       │          │          │
     └───────┴──────────┴──────────┘
                    │
                    ▼
           ArmorIQ Policy Engine
                    │
            ┌───────┴───────┐
            ▼               ▼
          ALLOW           BLOCK
            │               │
            ▼               ▼
        Tool Exec       Audit Event
```

---

## 2. Agent System Architecture

The core runtime uses **LangGraph** for stateful multi-agent execution. Each agent represents an isolated operational entity with its own system prompt, client keypair, and delegated authority.

### 1. Career Commander (Orchestrator)
* **Role:** Translates natural language user intents into executable multi-step plans.
* **Responsibilities:** Plan generation, agent delegation, plan progress tracking, result aggregation.
* **Key Constraint:** Cannot execute tools directly; must delegate to domain sub-agents.

### 2. Discovery Agent
* **Delegated Authority:** `search_opportunities`, `get_opportunity_details`
* **MCP Server:** `opportunity-mcp`
* **Capabilities:** Queries internal vector indices, invokes scrapers, filters by location/role.

### 3. ATS Analysis Agent
* **Delegated Authority:** `read_resume`, `analyze_resume_against_jd`, `score_resume`
* **MCP Server:** `resume-mcp`
* **Capabilities:** Extracts semantic requirements, assesses keyword density, identifies missing skills.

### 4. Matching Agent
* **Delegated Authority:** `read_profile`, `read_opportunities`, `calculate_match_matrix`
* **MCP Server:** `matching-mcp`
* **Capabilities:** Executes hybrid vector + deterministic scoring algorithms.

### 5. Ranking Agent
* **Delegated Authority:** `read_matches`, `apply_preference_weights`, `rank_opportunities`
* **MCP Server:** `ranking-mcp`
* **Capabilities:** Computes dynamically re-weighted opportunity scores based on user priorities.

### 6. Resume Agent
* **Delegated Authority:** `read_resume`, `create_resume_version`, `compare_resume_versions`
* **MCP Server:** `resume-mcp`
* **Capabilities:** Formats, structures, and tailors resume content grounded strictly in verified profile data.

### 7. Application Agent
* **Delegated Authority:** `prepare_application`, `get_application_questions`, `draft_answers`
* **Restricted Tools (Dangerous):** `submit_application`, `send_application_email`
* **Behavior:** Attempting `submit_application` without explicit human authorization triggers an **ArmorIQ Scope Violation (BLOCK)**.

---

## 3. Model Context Protocol (MCP) Server Design

Tools are encapsulated in distinct MCP servers to create clear operational and security boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Servers Layer                      │
├──────────────────────┬──────────────────────┬───────────────┤
│   opportunity-mcp    │      resume-mcp      │application-mcp│
├──────────────────────┼──────────────────────┼───────────────┤
│ • search_jobs()      │ • get_resume()       │ • prepare_app │
│ • search_competitions│ • analyze_resume()   │ • submit_app  │
│ • get_opportunity()  │ • create_version()   │ • send_email  │
└──────────────────────┴──────────────────────┴───────────────┘
```

---

## 4. ArmorIQ Security & Delegation Policy Engine

ArmorIQ evaluates every tool invocation against active delegation records.

### Delegation Flow Sequence
1. **Intent Capture:** User provides intent → `PLAN-8F91` created.
2. **Delegation Creation:** Commander issues scoped token:
   $$\text{DelegationToken} = \{\text{Parent: Commander, Child: ApplicationAgent, Scope: ["prepare\_application"], Expiry: TTL}\}$$
3. **Tool Invocation Request:** Child agent requests `submit_application()`.
4. **Policy Verification:**
   ```
   PLAN SCOPE  = ["prepare_application"]
   REQUESTED   = "submit_application"
   EVALUATION  = REQUESTED ∉ PLAN SCOPE
   DECISION    = BLOCK
   ```
5. **Event Dispatch:** A security event `SCOPE_VIOLATION` is dispatched to the audit trail and UI.

---

## 5. Relational & Vector Database Schema (PostgreSQL + pgvector)

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Core Users & Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    location VARCHAR(255),
    remote_preference VARCHAR(50),
    availability_status VARCHAR(50),
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    verified BOOLEAN DEFAULT TRUE,
    years_experience NUMERIC(3,1)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT[],
    repo_url TEXT,
    demo_url TEXT
);

-- Resumes & Tailoring
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_json JSONB NOT NULL,
    is_baseline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    opportunity_id UUID,
    version_name VARCHAR(100) NOT NULL,
    content_json JSONB NOT NULL,
    diff_summary JSONB,
    ats_score NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- job, internship, hackathon, competition
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    salary_range VARCHAR(100),
    deadline TIMESTAMP WITH TIME ZONE,
    description TEXT NOT NULL,
    requirements TEXT[],
    embedding vector(1536),
    source_url TEXT UNIQUE NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches & Applications
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) NOT NULL,
    ats_score NUMERIC(5,2),
    skill_score NUMERIC(5,2),
    experience_score NUMERIC(5,2),
    breakdown_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- discovered, ready, approval_required, submitted, rejected
    prepared_answers JSONB,
    resume_version_id UUID REFERENCES resume_versions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents, Governance & Audit
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    intent TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE delegations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    parent_agent VARCHAR(100) NOT NULL,
    child_agent VARCHAR(100) NOT NULL,
    allowed_scopes TEXT[] NOT NULL,
    delegation_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plans(id),
    delegation_id UUID REFERENCES delegations(id),
    agent_name VARCHAR(100) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    arguments JSONB,
    decision VARCHAR(20) NOT NULL, -- ALLOW, BLOCK
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. 5-Stage Hybrid Matching Engine

To eliminate LLM hallucination and ensure scoring reproducibility, the matching engine combines deterministic filters, vector similarity, and weighted scoring:

$$\text{Final Score} = w_1 S_{\text{skills}} + w_2 S_{\text{exp}} + w_3 S_{\text{proj}} + w_4 S_{\text{ats}} + w_5 S_{\text{elig}} + w_6 S_{\text{loc}} + w_7 S_{\text{domain}} + w_8 S_{\text{dead}}$$

### Stage Breakdown

| Stage | Process | Description |
| :--- | :--- | :--- |
| **Stage 1 — Hard Filters** | SQL / Rule Check | Excludes candidates failing mandatory eligibility (e.g., citizenship, graduation year, location restrictions). |
| **Stage 2 — Vector Retrieval** | `pgvector` Cosine Sim | Calculates semantic similarity between candidate embedding and opportunity embedding ($S_{\text{sem}}$). |
| **Stage 3 — Feature Scoring** | Deterministic Match | Scores explicit skill overlap ($S_{\text{skills}}$), years of experience ($S_{\text{exp}}$), and project match ($S_{\text{proj}}$). |
| **Stage 4 — LLM Reasoning** | Gemini Analysis | Extracts nuanced qualitative evidence from project descriptions to score domain alignment ($S_{\text{domain}}$). |
| **Stage 5 — Re-weighting** | Score Composition | Applies user preference sliders (e.g., Remote +50%, Salary +20%) to re-rank candidate matches dynamically. |

---

## 7. Data Ingestion & Scraping Architecture

```
Scheduler (Cron/ARQ)
       ↓
Source Connectors (APIs / RSS / Playwright)
       ↓
Fetcher & Parser
       ↓
Normalizer (Zod Schema Validation)
       ↓
Deduplicator (URL / Content Hash)
       ↓
Postgres Storage & Vector Embedding Generator
       ↓
User Match Notification Pipeline
```

* **Playwright Scraping:** Reserved for dynamic web pages with appropriate rate-limiting, user-agent rotation, and robots.txt compliance.
* **APIs / Feeds:** Preferred primary sources (GitHub Jobs APIs, Devpost RSS, RSS opportunity feeds).

---

## 8. Real-time Architecture & SSE Stream

Communication between the FastAPI agent backend and React frontend uses Server-Sent Events (SSE) for low-latency streaming:

### Event Stream (`GET /api/events/stream`)
* `agent.started` — Sub-agent initiated task.
* `agent.delegated` — Parent agent issued delegation token.
* `tool.invoked` — Agent requested tool execution.
* `tool.allowed` — ArmorIQ policy ALLOWED execution.
* `tool.blocked` — ArmorIQ policy BLOCKED execution (scope violation).
* `approval.required` — System waiting for human approval.
* `agent.completed` — Agent finished task execution.

---

## 9. Core API Specifications

### Opportunities
* `GET /api/opportunities` — Query & filter opportunity catalog.
* `GET /api/opportunities/:id` — Detailed opportunity intelligence report.
* `POST /api/opportunities/search` — Vector semantic search.

### Matching & Re-ranking
* `GET /api/matches` — List candidate opportunity matches.
* `POST /api/matches/analyze` — Trigger on-demand ATS/match analysis.
* `POST /api/ranking/recalculate` — Re-calculate ranks with custom preference weights.

### Resumes
* `GET /api/resumes` — Get user baseline resume.
* `POST /api/resumes/tailor` — Generate tailored resume version for opportunity.
* `GET /api/resumes/:id/versions` — Get version history and diffs.

### Applications & Security
* `GET /api/applications` — Get application Kanban pipeline.
* `POST /api/applications/prepare` — Trigger application prep agent.
* `POST /api/applications/:id/approve` — User human approval for blocked submission.
* `GET /api/delegations` — Active agent delegation tree.
* `GET /api/audit` — Immutable audit log events.
* `GET /api/security/events` — Security violation events.

---

*End of Technical Requirements Document (TRD)*
