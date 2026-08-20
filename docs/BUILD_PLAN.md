# Build Plan & Development Strategy — CareerOS

**Product Title:** CareerOS — Step-by-Step Execution Plan & Roadmap  
**Document Version:** 1.0.0  

---

## 1. Core Technical Philosophy & Strategy

To avoid building a disconnected prototype, CareerOS is developed using **incremental vertical slices**. We prioritize getting an interactive, end-to-end governed workflow operating with clean mock interfaces before scaling background scrapers and secondary features.

### Primary Rule of Execution
> **Never build all agents, all scrapers, and all UI components simultaneously.**  
> Build **one vertical slice first** (User Intent → Commander → Discovery Agent → Opportunity MCP → ArmorIQ policy check → Audit Log) and then layer on remaining agents and services.

---

## 2. Technology Stack Selection Matrix

| Layer | Recommended Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite | Maximum rendering performance, strict types, fast DX. |
| **UI Components & Styling** | Tailwind CSS + shadcn/ui | Premium SOC/Vercel aesthetic, accessible UI primitives. |
| **Animations & Graphs** | Framer Motion + React Flow (XYFlow) | Smooth layout transitions & interactive multi-agent visualizer. |
| **State Management** | Zustand (Client) + TanStack Query (Server) | Decoupled client state and clean API query caching. |
| **Backend API** | Python 3.11+ + FastAPI | High concurrency, native async SSE, seamless Python AI ecosystem integration. |
| **Agent Orchestration** | LangGraph | Stateful multi-agent loops, persistence, retries, and human-in-the-loop support. |
| **Database & Vectors** | PostgreSQL + `pgvector` | Relational integrity for users/delegations + vector similarity search in one DB. |
| **Agent Protocol** | Model Context Protocol (MCP) | Clean security boundary separating agent reasoning from tool execution. |
| **Policy Governance** | ArmorIQ SDK | Cryptographic delegation scope enforcement & violation interception. |
| **Realtime Stream** | Server-Sent Events (SSE) | Lightweight, single-direction streaming of agent events to UI. |

---

## 3. 9-Phase Sequential Development Roadmap

```
PHASE 1: Frontend Product UI & Mock Data Services
   │
   ▼
PHASE 2: PostgreSQL Database + FastAPI Core Backend
   │
   ▼
PHASE 3: Opportunity Ingestion & Scraping Pipeline
   │
   ▼
PHASE 4: ATS Analysis & Hybrid Matching Engine
   │
   ▼
PHASE 5: LangGraph Multi-Agent Orchestration
   │
   ▼
PHASE 6: Isolated MCP Server Implementations
   │
   ▼
PHASE 7: ArmorIQ Delegation & Policy Enforcement
   │
   ▼
PHASE 8: Automated Security Violation Demo Flow
   │
   ▼
PHASE 9: Containerization, Testing & Deployment
```

### Phase Details

#### Phase 1: Frontend UI & Mocks (Current Focus)
* Build application shell, routing, dark SOC theme.
* Implement Dashboard, Live Activity Feed, React Flow Agent visualizer, Opportunity catalog, ATS panel, Re-ranking lab, Resume diff, Delegation center, and ArmorIQ blocked action modal.
* Use realistic TypeScript mock data services.

#### Phase 2: Database & Core Backend
* Set up PostgreSQL database with `pgvector` extension.
* Execute SQLAlchemy / Alembic migrations for tables (`users`, `profiles`, `opportunities`, `matches`, `delegations`, `audit_events`).
* Build basic FastAPI REST endpoints.

#### Phase 3: Opportunity Ingestion Pipeline
* Build API connectors & Playwright fetchers for job/hackathon sources.
* Build normalizer, deduplicator, and vector embedding job pipeline (BGE / Gemini embeddings).

#### Phase 4: ATS & Hybrid Matching Engine
* Implement 5-stage matching algorithm (Hard filters, semantic search, feature scoring, qualitative reasoning, dynamic preference re-ranking).
* Build resume keyword extraction & evidence checker.

#### Phase 5: LangGraph Agents
* Implement Commander Agent and specialized sub-agents in LangGraph.
* Set up state persistence for human approval pause/resume loops.

#### Phase 6: MCP Tool Servers
* Create isolated MCP servers: `opportunity-mcp`, `resume-mcp`, `application-mcp`.

#### Phase 7: ArmorIQ Delegation & Policy Layer
* Integrate ArmorIQ policy engine.
* Bind parent-to-child delegation tokens and check tool calls prior to MCP execution.

#### Phase 8: Interactive Security Demo Mode
* Build `/demo` flow illustrating step-by-step discovery, tailoring, unauthorized `submit_application` attempt, ArmorIQ block, and human approval override.

#### Phase 9: Deployment & Polish
* Docker Compose setup for local production testing.
* Deploy frontend to Vercel and backend to Railway/Render/AWS.

---

## 4. Golden Path Demo Scenario ("Killer Demo Flow")

For competitions and judge demonstrations, the system executes the following 60-second golden path:

1. **User Prompt:** *"Find and prepare applications for the best AI/ML internships in Bangalore or Remote."*
2. **Autonomous Execution:**
   * Commander delegates search scope to **Discovery Agent** → Finds NVIDIA AI/ML Intern role (94% match).
   * Commander delegates ATS scope to **ATS Agent** → Evaluates candidate resume (`91/100` ATS score).
   * Commander delegates tailoring scope to **Resume Agent** → Generates `Mohit_NVIDIA_AI_Intern.pdf` based on verified profile evidence.
   * Commander delegates prep scope to **Application Agent** → Prepares form fields and answers.
3. **Scope Violation Trigger:**
   * **Application Agent** attempts to execute `submit_application()`.
   * **ArmorIQ Policy Intercepts:** Detects `submit_application` is **NOT** in the delegated scope (`["prepare_application"]`).
   * **Result:** Execution is **BLOCKED**.
4. **Visual Alert & Human Approval:**
   * UI displays red ArmorIQ Security Violation modal with full delegation chain.
   * Demonstrator clicks **"Approve Application Submission"**.
   * Policy status changes to `ALLOWED`, application submits, and audit event logs permanently.

---

## 5. Monorepo Directory Layout Blueprint

```
careeros/
├── docs/                      # Documentation specifications
│   ├── PRD.md
│   ├── TRD.md
│   ├── FRONTEND_SPEC.md
│   └── BUILD_PLAN.md
│
├── frontend/                  # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── api/               # REST API Routes
│   │   ├── agents/            # LangGraph Multi-Agent Workflows
│   │   ├── mcp/               # MCP Tool Integrations
│   │   ├── services/          # Matching, ATS, Ingestion Services
│   │   ├── models/            # SQLAlchemy DB Models
│   │   ├── schemas/           # Pydantic Schemas
│   │   ├── security/          # ArmorIQ Policy & Delegation Rules
│   │   └── workers/           # ARQ / Redis Background Jobs
│   ├── tests/
│   ├── requirements.txt
│   └── main.py
│
├── mcp-servers/               # Isolated MCP Servers
│   ├── opportunity-mcp/
│   ├── resume-mcp/
│   └── application-mcp/
│
├── infrastructure/            # Deployment & DB Configuration
│   ├── docker/
│   ├── migrations/            # Alembic DB Migrations
│   └── docker-compose.yml
│
└── README.md                  # Project Entry Point Index
```

---

## 6. Competitive Differentiation & Pitch Strategy

When presenting CareerOS to judges, focus on these 3 key technical highlights:

1. **Not Just a Job Board — An AI Ops Command Center:** We replace passive search tables with autonomous agent networks that actively work on behalf of the candidate.
2. **Truthful AI Tailoring:** We guarantee zero hallucination by forcing resume tailoring to be strictly grounded in verified candidate profile evidence.
3. **Cryptographic Agent Governance (ArmorIQ):** We showcase how multi-agent delegation can be governed safely using explicit scopes, distinct keypairs, real-time scope enforcement, and visual audit trails.

---

*End of Build Plan & Development Strategy*
