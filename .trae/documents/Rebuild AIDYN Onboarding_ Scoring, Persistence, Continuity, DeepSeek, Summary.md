# Objectives
Resolve onboarding reliability end‑to‑end: robust scoring, persistent chat/storage, cross‑device continuity, DeepSeek resilience, and structured summaries with validation, tests, and monitoring.

## Architecture Overview
- **Data Model**
  - `onboarding/{uid}` — current state: `userId`, `currentStage`, `progress{stage→%}`, `score`, `status`, `completion`, `lastUpdated`.
  - `onboarding_sessions/{sessionId}` — per session: `userId`, `startedAt`, `endedAt?`, `deviceInfo`, `deepseekLatencyMs`, `errorCounts`.
  - `onboarding_sessions/{sessionId}/messages/{messageId}` — chat stream: `{role, text, stage, ts, meta}` (immutable event log).
  - `onboarding_summaries/{uid}` — final structured summary JSON + `confidence`, `validatedAt`, `version`.
- **Rules**
  - Owner‑only read/write; writes must include `userId == auth.uid`.
- **Indexes**
  - Composite on `messages` by `sessionId + ts`, summaries by `userId`.

## 1) Data Evaluation & Scoring
- **Stage Criteria** (transparent, per stage):
  - Identity: company name, industry, values → +points per present field; reject greetings/noise.
  - Product: offering, USPs, pricing → weighted fields; depth/specificity metrics (numbers, examples).
  - Audience: ICP descriptors, roles, segments → coverage score.
  - Positioning: competitors, differentiation → consistency checks against product.
  - Sales: KPIs, targets, cadence → quantifiers.
  - Voice: tone, style, do/don’t phrases → completeness.
- **Algorithm**
  - Parse answer → extract fields (regex + lightweight NLP), compute:
    - `completeness` (required fields hit)
    - `specificity` (numbers/examples)
    - `consistency` (cross‑field checks)
  - Compute per‑stage score = weighted sum; ignore irrelevant inputs (greetings/noise) using keyword/intent filter.
  - Overall = mean of per‑stage scores; status flips when all ≥ thresholds.
- **Transparency**
  - Store per‑stage breakdown in `onboarding/{uid}.scoreBreakdown` for audit.

## 2) AI Chat Preservation
- **Persistent Storage**
  - Append each user/assistant message to `onboarding_sessions/{sessionId}/messages` with `{role, stage, ts, text}`.
  - Mirror minimal content in `onboarding/{uid}.conversationTail` (last N messages) for fast hydration.
- **Retrieval**
  - On login: resolve active `sessionId` from `onboarding/{uid}.activeSessionId`; stream messages ordered by `ts`.
  - Resume chat at `currentStage` with tail context; full history loaded on demand.

## 3) Cross‑Device Continuity
- **State Management**
  - `onboarding/{uid}` is the single source of truth; listeners hydrate UI.
  - Session management: create a new session per auth login; write `activeSessionId`.
  - Robust writes: `updateDoc` with field paths; retry/backoff; offline queue.
- **Edge Cases**
  - Interrupted sessions: status `in_progress`; keep `lastUpdated`.
  - Partial completions: continue at first stage < threshold.

## 4) DeepSeek Integration
- **Connectivity**
  - Validate key present; health check endpoint (simple test completion).
  - Streaming with fallback to non‑stream; timeouts and retries.
- **Error Handling**
  - Graceful degradation: show message and continue; log `app_logs` with `source='deepseek'`.
- **Metrics**
  - Capture latency, token counts, failures per session; store on `onboarding_sessions`.

## 5) Onboarding Summary
- **Generation**
  - After thresholds met: prompt DeepSeek to produce structured summary JSON (schema: Identity, Product, ICP, Positioning, Sales, Voice).
- **Validation**
  - Client validator ensures required fields present; compute `summaryConfidence`.
- **Storage**
  - Save to `onboarding_summaries/{uid}` and link on `users/{uid}.onboardingSummaryId`.
  - Index by `userId` for fast retrieval.

## Implementation Plan
### Phase A: Data Layer & Rules
- Create `onboarding_sessions` + `messages` subcollection; update rules/indexes.
- Replace array storage with subcollection events; maintain tail cache in state doc.

### Phase B: Scoring Engine
- Implement per‑stage extractors and weighted scoring; noise filter.
- Write `scoreBreakdown` and stage scores to state doc on every answer.

### Phase C: UI & Continuity
- Hydrate chat from messages (ordered by `ts`); hydrate progress/score/state from `onboarding/{uid}`.
- Show live Overall %, Score, Status from doc; no local derivation bugs.

### Phase D: DeepSeek Resilience
- Add health check and fallback; instrument latency and errors; UI banners on failure.

### Phase E: Summary & Validation
- Implement summary generation; validate; persist.

### Phase F: Tests & Monitoring
- Unit: scoring functions, validators, DeepSeek client.
- Integration: Firestore writes/reads, session continuity.
- E2E: multi‑browser resume, failure/retry, summary.
- Monitoring: write completion/abandon rates to `app_logs` + optional BigQuery.
- GDPR: user‑requested delete clears `sessions/messages/summaries` and tail caches.

## Deliverables
- Refactored data model, scoring & storage with subcollections.
- Live continuity across devices; robust DeepSeek flows.
- Summary generation & storage; docs & tests.

## Timeline
- Day 1–2: Data model + rules + indexes, scoring implementation.
- Day 3: UI hydration, DeepSeek resilience.
- Day 4: Summary + validation + tests.
- Day 5: Monitoring + documentation & polish.

## Risks & Mitigations
- Network blocking → use retries/fallback; banner feedback.
- Inconsistent writes → field‑path updates only; transaction if needed.
- Model drift in DeepSeek → keep client validators authoritative; prompt versioning.

## Next Step
Proceed to implement Phase A and B: migrate chat to messages subcollection, update rules/indexes, integrate scoring engine, and wire live state updates. 