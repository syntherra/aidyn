# Goal
Implement a post‑signup flow that turns the current sign‑up card into a dual‑panel AI onboarding experience (chat + live dashboard), collecting structured business data in ~8–12 minutes with smooth transitions, validation, and real‑time sync.

## Transition & State Flow
- Trigger: on successful signup (Google/Firebase auth already working).
- Animation: slide the sign‑up card `div` left and morph into an onboarding shell.
  - Framer Motion: `AnimatePresence` + `motion.div` with 500ms `easeInOut` transitions.
  - States: `signup → onboarding(chat+dashboard) → review/complete`.
- Routing: keep hash router; no full page reload. Mount `OnboardingShell` inside the existing layout.

## UI Architecture
- **OnboardingShell** (grid: 40% left / 60% right; responsive to 1‑column on mobile)
  - **Left Panel (ChatPanel)**
    - DeepSeek AI chat stream with system/tool prompts.
    - Stage headings and assistant messages; input box with send.
    - Conversation stages:
      1. Business Identity
      2. Product/Service
      3. Target Audience
      4. Market Positioning
      5. Sales Objectives
      6. Brand Voice
    - Message timeline component; supports pause/resume and “edit last answer”.
  - **Right Panel (DashboardPanel)**
    - Progress groups for each stage, 0–100% completion.
    - Quality indicators: depth, specificity, consistency.
    - Missing info list with actionable chips to jump back into chat.
    - Visualization module:
      - Radar chart (Recharts) to show relative completeness/quality across categories (styled to match AIDYN).
      - KPI cards: confidence score, threshold badges (“Ready”, “Needs work”).
- **Component Library**
  - `ProgressBar`, `QualityBadge`, `MissingInfoChip`, `KpiCard`, `RadarChart`, `StageHeader`.
  - Reuse tokens from `src/styles/tokens.scss`; keep typography Inter; colors: neutrals + accent orange.

## Animation Details
- Card morph: the existing sign‑up card animates off‑canvas left (`x: -40vw`, opacity → 0); `OnboardingShell` fades/slides in from right (`x: 20vw → 0`, opacity → 1).
- Panel resize: left fixed at 40%, right at 60%; animate layout with CSS grid + Framer Motion layout animations.
- Motion timing: 500ms, `easeInOut`; stagger child elements by 80ms.

## AI Integration (DeepSeek)
- API Setup
  - Env: `VITE_DEEPSEEK_API_KEY`.
  - Client: streaming responses via fetch or official SDK.
- Prompting Strategy
  - System prompt distilled from `/docs/AIDYN ONBOARDING INTERVIEW STRUCTURE .rtf` into 6 stages.
  - Tool/assistant instructions to return JSON chunks per answer with fields for stage, signals, and confidence.
- Conversation Orchestration
  - Finite State Machine (XState or minimal reducer): `stage`, `pending`, `completed`, `backtrack`.
  - Handlers push user messages, stream assistant, extract JSON (via a robust JSON boundary parser), and persist.

## Validation & Self‑Check
- Per‑stage validators:
  - Completeness thresholds (e.g., Identity ≥80, Product ≥75, Audience ≥75, Positioning ≥70, Sales ≥70, Voice ≥80).
  - Specificity score: weighted n‑gram richness, presence of quantifiers, examples.
  - Consistency checks: ICP aligns with product benefits; KPIs match sales cycle; brand tone coherent.
- Confidence Scoring
  - Combine AI self‑confidence from JSON + validator outputs.
- Feedback
  - Dashboard turns sections green at threshold; shows “Ready” badge; chat confirms readiness.

## Data Handling & Sync
- Parse requirements from the RTF doc (already read) and codify the schema.
- Firestore (extend existing):
  - `onboarding_sessions/{sessionId}`: userId, startedAt, currentStage, completion%, confidence, lastUpdated.
  - `onboarding_answers/{answerId}`: sessionId, stage, text, structured (map), depthScore, specificityScore, confidence, createdAt.
  - `onboarding_metrics/{sessionId}`: per‑stage scores, cross‑validation results, readyFlags.
  - Link to `users/{uid}` and save final “profile summary” to `users/{uid}.onboardingSummary`.
- Real‑time listeners update dashboard; chat writes answers immediately; metrics recomputed on each write (client middleware initially; later server functions).

## Implementation Phases
### Phase 1 — UI/UX
- High‑fidelity mockups for: transition, chat panel, dashboard (radar + progress groups + KPIs).
- Animation storyboard: exact easing/timing; stagger plan; responsive breakpoints.
- Build `OnboardingShell`, `ChatPanel`, `DashboardPanel` scaffolding + tokens.

### Phase 2 — AI Integration
- DeepSeek client with streaming; system prompt and stage prompts.
- Conversation orchestrator (FSM) and streaming parser.
- JSON extraction and shape validation; error recovery dialogue.

### Phase 3 — Validation & Sync
- Implement per‑stage validators and scoring functions.
- Firestore write/read, real‑time listeners; metrics aggregation.
- Radar, progress, and “missing info” mapping; jump actions call chat with targeted follow‑ups.

### Phase 4 — Development & Animation
- Framer Motion transitions and panel animations; accessibility focus management.
- Mobile: single column; chat on top, dashboard below.

### Phase 5 — Testing
- Conversational flow user tests (scripted scenarios from the RTF categories).
- Animation performance: ensure 60fps; measure with DevTools.
- Validation QA: simulate inputs across thresholds, edge cases.
- Firestore security tests: ensure only owner can write/read their onboarding data.

## Technical Notes
- Libraries:
  - Framer Motion for animation
  - Recharts for radar & bars
  - XState or reducer for stage flow
- Env:
  - `VITE_DEEPSEEK_API_KEY`; retry/backoff on network errors.
- Accessibility:
  - Announce stage changes; maintain focus; keyboard shortcuts for navigation.
- Security:
  - No secrets in repo; tokens via env; Firestore rules restrict data to owner.

## Deliverables
- OnboardingShell with animated transition from sign‑up.
- DeepSeek chat collecting 6 categories with structured JSON.
- Dashboard with progress, radar, KPIs, missing info.
- Validators + confidence scoring; readiness confirmation.
- Firestore schema extensions; real‑time sync; analytics events.
- Test plan & scripts; documentation for setup and flows.

## Success Criteria & Metrics
- Onboarding time 8–12 minutes (instrument time per stage; optimize prompts).
- ≥90% data completeness; thresholds enforced; visual readiness states.
- User CSAT ≥4.5/5 (post‑onboarding survey).
- AI understanding ≥85% (validator + manual review sample).

## Next Steps
- Confirm the plan; I’ll scaffold `OnboardingShell` and the animation, integrate Framer Motion, build the chat and dashboard shells, wire Firebase session docs, then add DeepSeek streaming and validators. I’ll deliver a working vertical slice first (Identity + Product), then expand to all categories.