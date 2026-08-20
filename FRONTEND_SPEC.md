# Frontend Product Specification — CareerOS

**Product Title:** CareerOS — Frontend Product Build & UI/UX Specification  
**Target Visual Language:** Dark-first Mission Control / AI Operations Center (Linear, Vercel, SOC Dashboards)  
**Document Version:** 1.0.0  

---

## 1. Technical Frontend Stack

```
Framework:        React 18+ (TypeScript)
Build Tool:       Vite
Styling:          Tailwind CSS v3+
UI Components:    shadcn/ui, Radix UI primitives
Icons:            Lucide React
Animations:       Framer Motion
Graph / Diagrams: React Flow (XYFlow)
Charts:           Recharts
Routing:          React Router v6
Client State:     Zustand
Server State:     TanStack Query (React Query v5)
Form Validation:  React Hook Form + Zod
Date Handling:    date-fns
```

---

## 2. Design Direction & Aesthetic Guidelines

### Core Visual Theme: "Mission Control for Autonomous AI Career Systems"

```
Background:         Near-black (#090A0F, #0D0E15)
Panels & Cards:     Charcoal (#141622, #1A1D2C)
Borders:            Subtle dark gray (#26293B)
Typography:         Clean sans-serif (Inter / Geist), high contrast white & muted gray
Semantic Color Palette:
  • Authorized / Success:  Emerald Green (#10B981)
  • Pending / Warning:     Amber (#F59E0B)
  • Blocked / Security:    Crimson Red (#EF4444)
  • Agent Execution:       Electric Blue / Indigo (#3B82F6, #6366F1)
```

### UX Principles
* **Semantic Color Usage:** Never use color decoratively; colors strictly reflect agent security and authorization state.
* **Dense Information Architecture:** High density, crisp typography, clean data tables, compact card layouts.
* **Restrained Motion:** Smooth micro-animations for live event feed insertions, re-ranking layout shifts, graph edge flows, and security modals. Respect `prefers-reduced-motion`.

---

## 3. Application Routes & Shell Structure

### Navigation Hierarchy
```
/dashboard           — Main Operations Center Dashboard
/opportunities       — Opportunity Intelligence & Filterable Catalog
/opportunities/:id   — Detailed Opportunity Intelligence Report
/competitions        — Hackathons & Competitions Catalog
/resume              — Baseline Resume & Resume Lab
/resume/:versionId   — Side-by-Side Resume Diff View
/matches             — Candidate Match Engine & Analysis
/applications        — Application Pipeline Kanban Board
/applications/:id    — Application Details & Submission Controls
/agents              — Agent Network List
/agents/:agentId     — Individual Agent Details & Delegation History
/delegations         — Visual Agent Delegation Tree
/audit               — Immutable Audit Trail Timeline
/security            — ArmorIQ Security Overview & Policy Log
/demo                — Security Violation Demo Mode Flow
/settings            — User Profile & Career Preferences
```

### Global Application Shell Layout
* **Left Sidebar (Collapsible):** CareerOS Logo, Navigation Sections (Command Center, AI Operations, Security, System), User Profile card with completeness & status indicator.
* **Top Command Bar:** Persistent search input (`Cmd + K`) with placeholder: *"Ask CareerOS anything... (e.g. Find remote AI internships, Re-rank by salary)"*.
* **Center Main Canvas:** Main route view content.
* **Optional Right Activity Drawer:** Live streaming agent activity feed.

---

## 4. Key Screen & Component Specifications

### 4.1 Dashboard (`/dashboard`)
* **Top Section:** Greeting (*"Good evening, Mohit. Your career operations are running autonomously."*).
* **Metric Cards:** Opportunities Discovered, Strong Matches, High-Confidence Matches, Applications Ready, Blocked Actions (Security Alert).
* **Live Agent Activity Stream:** Real-time event feed with timestamped agent actions (Discovery, ATS analysis, Ranking, Resume tailoring, ArmorIQ block).
* **Agent Status Row:** Compact badges showing status for each agent (`IDLE`, `RUNNING`, `WAITING`, `BLOCKED`).

### 4.2 Interactive Agent Network Visualizer (`/agents` / React Flow)
* **Interactive Nodes:** Career Commander, Discovery Agent, ATS Agent, Matching Agent, Ranking Agent, Resume Agent, Application Agent, ArmorIQ Policy Shield, MCP Tool Nodes.
* **Node Badges:** Agent Name, Operational Status, Current Task, Authority Scope, Keypair ID.
* **Animated Edges:** Pulsing blue lines during tool execution; red flashed pulse when ArmorIQ blocks an unauthorized call.

### 4.3 Opportunity Intelligence & Detail Views (`/opportunities`, `/opportunities/:id`)
* **Filters:** Role, Skills, Location, Remote, Salary, Deadline, Opportunity Type (Job, Internship, Hackathon, Competition).
* **Card Details:** Company logo/name, Match %, ATS %, Skill overlap %, Eligibility badge, Deadline urgency.
* **Detail Intelligence Report:** Full JD, candidate fit radial chart, skill matrix (Matched, Partial, Missing), ATS feedback panel.

### 4.4 ATS Analysis Panel
* **Score Indicator:** Big metric radial (`91 / 100`).
* **Sub-Scores:** Keyword Coverage %, Semantic Match %, Experience Evidence %, Formatting Score %.
* **Evidence Breakdown:** Exact bullet explanations connecting candidate profile items to JD requirements.

### 4.5 Dynamic Re-Ranking Lab (`/matches`)
* **Preference Controls:** Sliders for Remote Priority, Salary Priority, Brand Urgency, Learning Score, Deadline Urgency.
* **Animated Re-ordering:** When sliders adjust, list items animate seamlessly using Framer Motion `layout` prop.
* **Explanation Badges:** *"Moved +7 spots due to remote priority weighting."*

### 4.6 Resume Lab & Side-by-Side Diff View (`/resume/:versionId`)
* **Dual View:** Original Baseline Resume (Left) vs Tailored Resume Version (Right).
* **Diff Highlighting:** Green additions, Amber modifications, strike-through removals.
* **Verification Badges:** Shows *"Verified Profile Evidence"* tooltip for every modified statement to guarantee zero fabrication.

### 4.7 Delegation Center (`/delegations`)
* **Tree Visualizer:** Interactive tree displaying delegation lineage:
  `User Intent` → `Commander` → `Child Agent` → `Delegated Scope` → `Execution State`.

### 4.8 Blocked Action Security Modal (ArmorIQ Core UI)
When an agent attempts an unauthorized action (e.g., `submit_application`), a modal overlay appears:

```
┌─────────────────────────────────────────────────────────────┐
│ 🛡️ ARMORIQ SECURITY VIOLATION INTERCEPTED                  │
├─────────────────────────────────────────────────────────────┤
│ Agent Attempted:   ApplicationAgent.submit_application()    │
│ Delegated Scope:   ["prepare_application"]                  │
│ Decision:          BLOCKED                                  │
│ Reason:            Action exceeds delegated scope.          │
├─────────────────────────────────────────────────────────────┤
│ Chain: User → Commander → ApplicationAgent ❌ ArmorIQ      │
├─────────────────────────────────────────────────────────────┤
│ [ View Delegation ]  [ View Audit ]  [ Request Approval ]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. TypeScript Data Models (`src/types/index.ts`)

```typescript
export type AgentStatus = 'IDLE' | 'RUNNING' | 'WAITING' | 'BLOCKED' | 'COMPLETED';

export type PolicyDecision = 'ALLOW' | 'BLOCK' | 'PENDING';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'job' | 'internship' | 'hackathon' | 'competition';
  location: string;
  isRemote: boolean;
  salaryRange?: string;
  deadline: string;
  matchScore: number;
  atsScore: number;
  skills: string[];
  description: string;
}

export interface AgentNodeData {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask?: string;
  publicKey: string;
  delegatedScopes: string[];
  mcpServer: string;
}

export interface DelegationRecord {
  id: string;
  planId: string;
  parentAgent: string;
  childAgent: string;
  allowedScopes: string[];
  expiresAt: string;
}

export interface AuditEventRecord {
  id: string;
  timestamp: string;
  agentName: string;
  parentAgent: string;
  toolName: string;
  arguments: Record<string, any>;
  decision: PolicyDecision;
  reason?: string;
  delegationId: string;
  planId: string;
}
```

---

## 6. Interactive Security Demo Mode (`/demo`)

CareerOS includes a dedicated automated demo loop designed specifically for competition presentations:

1. **User clicks "Run Security Demo".**
2. **Step 1:** User intent submitted (*"Find and apply for top AI internships"*).
3. **Step 2:** Commander generates plan (`PLAN-8F91`).
4. **Step 3:** Discovery Agent searches & finds NVIDIA AI Internship (94% Match).
5. **Step 4:** ATS Agent scores resume (`91/100`).
6. **Step 5:** Resume Agent generates tailored resume `Mohit_NVIDIA_Tailored.pdf`.
7. **Step 6:** Application Agent attempts `submit_application()`.
8. **Step 7:** **ArmorIQ Security Violation modal pops up (RED ALERT)** showing scope mismatch.
9. **Step 8:** User clicks **"Approve Execution"** (Human-in-the-loop authorization).
10. **Step 9:** System converts decision to `ALLOW`, completes execution, and logs to Audit Trail.

---

## 7. Suggested Project Directory Structure

```
src/
├── assets/
├── components/
│   ├── ui/             # shadcn primitives (Button, Card, Dialog, Badge)
│   ├── layout/         # Shell, Sidebar, TopBar, ActivityDrawer
│   ├── agents/         # ReactFlow graph, AgentNode, StatusBadge
│   ├── opportunities/  # OpportunityCard, FilterBar, IntelligenceReport
│   ├── resume/         # ResumeDiff, TailorWorkflowModal
│   ├── applications/   # KanbanBoard, KanbanColumn, ApplicationCard
│   ├── security/       # ArmorIQModal, DelegationTree, SecurityStats
│   └── audit/          # AuditTimeline, EventDetailDialog
├── features/
│   ├── dashboard/
│   ├── demo/
│   └── matches/
├── hooks/              # useAgentStream, useReRanking, useOpportunities
├── pages/              # Route level view components
├── services/           # Service interfaces (mock API + REST client)
├── store/              # Zustand stores (useAgentStore, useAuthStore)
├── types/              # TypeScript contracts
└── lib/                # Utilities, date formatters, flow utils
```

---

*End of Frontend Product Specification*
