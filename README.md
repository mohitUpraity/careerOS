# CareerOS — Autonomous Career Intelligence & Application Platform

> **Track:** ArmorIQ Problem 2 Track — *"Who authorized that?"*  
> **Mission:** Mission Control for Autonomous AI Career Operations & Cryptographic Multi-Agent Governance.

---

## 🛡️ Executive Overview

**CareerOS** is an autonomous career intelligence and application platform designed to automate the end-to-end job discovery, ATS evaluation, resume tailoring, and application preparation workflow for job seekers and researchers.

Unlike generic job boards or AI wrappers, CareerOS implements a **dual-layer architecture**:
1. **Layer A — Autonomous Career Automation:** Discovery, ATS Scoring, Hybrid Vector Matching, Dynamic Re-Ranking, Truthful Resume Tailoring, Application Preparation.
2. **Layer B — Multi-Agent Trust & Security (ArmorIQ):** Parent-to-child agent delegation, distinct agent keypairs, real-time scope policy enforcement, blocked action visual alerts, and an immutable audit log.

---

## 📚 Complete Project Documentation

The specification of CareerOS has been decomposed into dedicated, modular documentation files:

| Document | Description | Key Focus Areas |
| :--- | :--- | :--- |
| **[📄 PRD.md](file:///Users/mohitupraity/Documents/projects/careerOS/PRD.md)** | **Product Requirements Document** | Vision, Problem Statement, Personas, Features F1–F12, Non-Functional Requirements. |
| **[⚙️ TRD.md](file:///Users/mohitupraity/Documents/projects/careerOS/TRD.md)** | **Technical Requirements Document** | System Architecture, LangGraph Agents, MCP Servers, ArmorIQ Engine, Postgres Schema, 5-Stage Matching Algorithm, API Specs. |
| **[🎨 FRONTEND_SPEC.md](file:///Users/mohitupraity/Documents/projects/careerOS/FRONTEND_SPEC.md)** | **Frontend Specification** | Dark SOC Visual Theme, Route Hierarchy, React Flow Agent Visualizer, Screen Specs, Mock Services, TypeScript Types, Demo Mode. |
| **[🚀 BUILD_PLAN.md](file:///Users/mohitupraity/Documents/projects/careerOS/BUILD_PLAN.md)** | **Build Strategy & Roadmap** | 9-Phase Execution Plan, Tech Stack Matrix, Golden Path Demo Flow, Monorepo Blueprint, Competitive Positioning. |

---

## 🛠️ Technology Stack Summary

```
Frontend:    React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Flow, Recharts
State:       Zustand (Client State), TanStack Query (Server State)
Backend:     Python 3.11+, FastAPI, SSE (Server-Sent Events)
AI Agents:   LangGraph, Gemini / OpenRouter, BGE / Gemini Vector Embeddings
Protocol:    Model Context Protocol (MCP)
Database:    PostgreSQL with pgvector extension
Governance:  ArmorIQ SDK (Cryptographic Scope Delegation & Verification)
```

---

## 🔑 Core Differentiating Feature: ArmorIQ Scope Interception

CareerOS directly satisfies the **ArmorIQ Problem 2 Track** requirement by implementing explicit agent delegation chains and policy verification:

```
User Intent ("Find & prepare AI internships")
      ↓
Commander Agent (Issues Scoped Token: ["prepare_application"])
      ↓
Application Agent (Executes prep steps...)
      ↓
Application Agent attempts dangerous tool: submit_application()
      ↓
ArmorIQ Policy Engine Checks: submit_application ∉ ["prepare_application"]
      ↓
❌ ACTION BLOCKED & LOGGED TO AUDIT TRAIL
      ↓
UI Displays Security Violation Intercept Modal → User clicks "Human Approval" → Execution proceeds cleanly.
```

---

## 📁 Repository Blueprint

```
careeros/
├── docs/                      # Documentation specifications
│   ├── PRD.md
│   ├── TRD.md
│   ├── FRONTEND_SPEC.md
│   └── BUILD_PLAN.md
├── frontend/                  # React + TS + Vite SOC Application
├── backend/                   # FastAPI + LangGraph Agent Backend
├── mcp-servers/               # Isolated MCP Tool Servers
├── infrastructure/            # Docker & PostgreSQL Migrations
└── README.md                  # Documentation Index
```
