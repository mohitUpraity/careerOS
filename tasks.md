# CareerOS End-to-End Task Tracking (`tasks.md`)

This tracking document defines every stage of the multi-agent pipeline, from opportunity collecting to application submitting, with explicit checkable tasks.

---

## 🎯 Phase 1: Main Commander Agent & Orchestration Wiring `[COMPLETED]`
- [x] Wire up Commander main agent in `backend/app/agents/workflows.py` to `LLMProvider` (Groq Llama-3.3-70B & Gemini 1.5 Flash).
- [x] Connect natural language prompt handling in `POST /api/chat` directly to Commander plan capture (`armoriq_engine.capture_plan()`).
- [x] Implement RSA 2048-bit token generation (`armoriq_engine.delegate()`) for all 6 child sub-agents.
- [x] Add error handling and clean state resets for failed orchestration loops.

---

## 🕷️ Phase 2: Opportunity Collecting & Ingestion Pipeline `[PENDING]`
- [ ] Connect `DiscoveryAgent` to Firecrawl API (`/v1/search` & `/v1/scrape`) with live `FIRECRAWL_API_KEY`.
- [ ] Ingest live job & hackathon listings from **Unstop**, **LinkedIn**, and **Indeed**.
- [ ] Deduplicate ingested records by `source_url` and store in `Opportunity` table.

---

## 🧬 Phase 3: ATS Matching & Semantic Vector Retrieval `[PENDING]`
- [ ] Connect `MatchingAgent` to Google Gemini `text-embedding-004` API to generate 768/1536-dim vector embeddings for profile & JDs.
- [ ] Calculate real mathematical Cosine Similarity across skills, experience, and domain relevance.
- [ ] Save top match records to `Match` table and trigger SSE updates (`agent.matched`).

---

## 📄 Phase 4: Resume Tailoring & Versioning Engine `[PENDING]`
- [ ] Connect `ResumeAgent` to **Groq (`llama-3.3-70b-versatile`)** to analyze ATS keyword gaps against target JD.
- [ ] Rewrite candidate resume bullet points with action verbs without fabricating false experience.
- [ ] Save new `ResumeVersion` to DB with diff summary and updated ATS score.

---

## 🛡️ Phase 5: ArmorIQ Scope Enforcement & Submission Intercept `[PENDING]`
- [ ] Intercept `ApplicationAgent.submit_application()` non-keyword scope violation.
- [ ] Log `BLOCK` decision to `AuditEvent` table and broadcast SSE `tool.blocked` event.
- [ ] Pause workflow and await explicit human-in-the-loop approval via `POST /api/applications/{id}/approve`.
- [ ] Complete submission upon user approval and update `Application` status to `"Submitted"`.
