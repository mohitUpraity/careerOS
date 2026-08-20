# Product Requirements Document (PRD) — CareerOS

**Product Title:** CareerOS — Autonomous Career Intelligence & Application Platform  
**Track / Theme:** ArmorIQ Problem 2 Track ("Who authorized that?")  
**Document Version:** 1.0.0  

---

## 1. Product Overview & Vision

### Vision
CareerOS is an autonomous career operations platform that continuously discovers opportunities (jobs, internships, hackathons, research roles, competitions), evaluates candidate fit using transparent matching algorithms, optimizes resumes using verified evidence, and prepares applications—all while ensuring every agent action is explicitly delegated, cryptographically authorized, and visually auditable.

### Architecture Concept: Dual-Layered Platform
CareerOS operates across two core functional layers:

```
Layer A — Career Automation Workflow
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

Layer B — Trust, Security & Governance (ArmorIQ)
            ArmorIQ Policy Layer
                     │
              User Intent
                     ↓
               Commander Agent
                     ↓
                Delegation
                     ↓
            Specialized Sub-Agents
                     ↓
               MCP Tool Call
                     ↓
              Authorization Check
                /           \
            ALLOW           BLOCK
              │               │
              ↓               ↓
           Execute          Audit
```

> **Note:** Layer B (Trust/Security & Governance) is the core differentiator for the ArmorIQ Problem 2 track. The platform is built not just as a career tool, but as a reference architecture for safe multi-agent delegation and scope enforcement.

---

## 2. Problem Statement

### The Job Seeker's Problem
Job seekers currently endure a fragmented, tedious, and manual job hunt lifecycle:
1. Searching across multiple disconnected portals.
2. Reading lengthy job descriptions.
3. Manually assessing eligibility & skill overlap.
4. Calculating ATS compatibility.
5. Hand-crafting tailored resumes for each opportunity.
6. Filling repetitive application forms.
7. Tracking applications across spreadsheets.

### The Multi-Agent Governance Problem
As AI transitions from single chatbots to multi-agent networks, parent agents delegate authority to specialized child agents. This introduces critical security challenges:
- **Scope Creep:** A child agent executing unauthorized actions outside its mandate (e.g., submitting an application or sending an email without user consent).
- **Auditability:** Inability to trace which child agent invoked a specific tool and under whose delegated authority.
- **Key Isolation:** Lack of distinct keypairs or client identities per sub-agent.

CareerOS addresses both problems simultaneously by providing autonomous career workflows governed by strict, cryptographically verified delegation policies.

---

## 3. Product Goals & Objectives

CareerOS transforms the traditional user mandate:
> *"I need to find a job and apply everywhere."*

Into an autonomous, safe execution loop:
`User Intent` → `Autonomous Discovery` → `Analysis & ATS` → `Matching & Ranking` → `Evidence-Based Tailoring` → `Application Preparation` → `Authorized Execution / Governance`.

### Key Objectives
1. **End-to-End Automation:** Reduce candidate time-to-application from hours to seconds while improving application quality.
2. **Transparent Match Intelligence:** Provide deterministic, explainable match scores and ranking updates.
3. **Zero Hallucination Guarantee:** Ensure resume tailoring only uses verified candidate profile evidence (no fabricated skills/experience).
4. **Cryptographic Scope Governance:** Enforce explicit delegation boundaries per agent using separate client keys/keypairs.
5. **Real-time Visual Auditing:** Provide a SOC-style command center showing live agent activity, delegation chains, tool invocations, blocked violations, and audit timelines.

---

## 4. Target Users & Personas

| Persona | Primary Goal | Key Need |
| :--- | :--- | :--- |
| **Early-Career Engineers & Students** | Find relevant internships, graduate roles, and hackathons. | Automated match scoring, ATS optimization, and rapid application prep. |
| **Hackathon & Competition Enthusiasts** | Discover high-value technical competitions and track deadlines. | Real-time discovery, eligibility checks, and deadline urgency alerts. |
| **Experienced Job Switchers** | Tailor resume evidence to specific senior/staff role requirements. | Explainable ATS analysis, side-by-side resume diffs, and domain alignment. |
| **Security & Agentic System Auditors** | Verify multi-agent scope compliance and security boundaries. | Clear delegation graph, ArmorIQ event log, and visual audit trail for blocked actions. |

---

## 5. Core Functional Requirements (F1 – F12)

### F1 — Multi-Source Opportunity Discovery
* **Description:** The system automatically discovers and ingests job listings, internships, hackathons, research positions, and technical competitions.
* **Sources:** APIs, RSS feeds, structured career portals, and compliant web scraping (Playwright/HTTP).
* **Metadata captured:** Role title, company, description, required skills, location, remote status, experience level, salary range, deadline, eligibility rules, source URL, opportunity type.

### F2 — Schema Normalization & Deduplication
* **Description:** Ingested data is parsed, normalized into a unified schema, and deduplicated across sources before embedding and storing.

### F3 — Comprehensive Candidate Profile
* **Description:** Maintains a verified user profile containing education, verified skills, structured projects, work experience, career preferences, location, baseline resume, GitHub/portfolio metadata, and availability status.

### F4 — ATS Analysis Engine
* **Description:** Evaluates candidate resume against opportunity requirements.
* **Output:**
  * Overall ATS Score (0–100)
  * Keyword Coverage %
  * Semantic Match %
  * Experience Evidence Score %
  * Project Evidence Score %
  * Formatting & Structural Quality Score %
  * Actionable feedback explaining missing or present evidence.

### F5 — Candidate-Opportunity Matching Engine
* **Description:** Calculates a holistic fit score combining hard eligibility filters, semantic vector similarity, and multi-factor scoring.

### F6 — Dynamic Re-ranking & Preference Lab
* **Description:** Allows candidates to adjust preferences (e.g., Remote Priority, Salary Priority, Brand Urgency, Learning Goals) and see live, animated re-ranking with explainable delta reasons (e.g., *"Moved +7 due to high remote match"*).

### F7 — Truthful Resume Tailoring
* **Description:** Generates opportunity-specific resume versions.
* **Strict Constraint:** **Zero fabrication.** Tailoring re-orders, re-emphasizes, and re-phrases verified profile evidence to match JD keywords without inventing experience.

### F8 — Application Preparation
* **Description:** Prepares form fields, answer drafts, custom cover letters, and email drafts.
* **Governance Rule:** Application preparation is allowed; automated submission (`submit_application`) requires explicit authorization or human approval.

### F9 — Multi-Agent System Orchestration
* **Description:** Employs specialized autonomous agents operating in concert (Commander, Discovery, ATS, Matching, Ranking, Resume, Application Agents).

### F10 — Explicit Delegation Chains
* **Description:** Parent agents (e.g., Commander) issue scoped delegation credentials to child agents, explicitly defining allowed tool invocations and operational boundaries.

### F11 — Authorization & Scope Enforcement (ArmorIQ)
* **Description:** Intercepts every tool call before execution. Verifies if the requested tool call matches the delegated authority. Blocks unauthorized actions and emits security events.

### F12 — Visual Audit Trail & Security Log
* **Description:** Maintains an immutable-style execution log recording `who`, `what`, `when`, `parent delegation`, `plan ID`, `tool call`, and `policy decision (ALLOW / BLOCK)`.

---

## 6. Non-Functional Requirements (NFRs)

### Security & Governance
* **Client Isolation:** Each agent maintains separate client keys/keypairs.
* **Zero Frontend Trust:** Authorization enforcement occurs strictly server-side within the ArmorIQ policy engine.
* **Delegation Expiration:** Delegations expire automatically after plan completion or TTL.
* **Secrets Protection:** LLM API keys, database credentials, and service tokens are kept securely on the server.

### Performance Benchmarks
* **Dashboard Initial Load:** `< 2.0s`
* **Opportunity Search & Filtering:** `< 5.0s`
* **ATS Analysis Generation:** `< 10.0s`
* **Dynamic Re-ranking Calculation:** `< 2.0s`
* **Real-time Event Latency (SSE):** `< 200ms`

### Reliability & Resilience
* **Fault Isolation:** Failure of a single child agent (e.g., Discovery scrape error) must not crash the main workflow loop.
* **State Checkpointing:** LangGraph workflow states are persistent to support retries, human-in-the-loop approvals, and resumes.

---

*End of Product Requirements Document (PRD)*
