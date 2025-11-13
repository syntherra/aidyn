# Onboarding Data Model

## Collection: `onboarding` (doc id = `uid`)
- `userId` (string, required, must equal auth uid)
- `completion` (boolean, default false)
- `lastUpdated` (timestamp)
- `progress` (map<string, number>) — keys: `identity`, `product`, `audience`, `positioning`, `sales`, `voice`
- `steps` (map) — per-stage structured data objects (normalized fields)
  - Example keys: `identity`, `product`, `audience`, `positioning`, `sales`, `voice`
  - Each value: `{ text: string, structured?: object }`

### Validation & Rules
- Users can read/write only their own doc (see `firestore.rules`).
- Writes must include `userId == request.auth.uid`.
- Client validates field types before writes; Firestore rules enforce ownership.

## Collections (optional future)
- `onboarding_sessions` — session timeline and analytics
- `onboarding_answers` — per-answer raw text and structured extraction

## Relationships
- `onboarding/{uid}` ↔ `users/{uid}` (profile)
- `onboarding_sessions.{userId}` links to `onboarding.{userId}`
- `onboarding_answers.{sessionId}` references `onboarding_sessions`

## Data Flow
1. On login, ensure `onboarding/{uid}` exists; default `completion=false`.
2. During chat, each answer updates `steps[stage]` and `progress[stage]`.
3. Validator computes confidence; when thresholds met, set `completion=true`.
4. Dashboard listens to `onboarding/{uid}` and reflects progress in real time.

## Error Handling
- Missing doc: create with defaults and proceed.
- Invalid formats: client-side validation and sanitize before write.
- Network issues: display retry UI; queue and merge writes when back online.

## Query APIs
- `getOrCreateOnboarding(userId)` → ensures doc exists
- `updateOnboarding(userId, patch)` → merges progress/steps
- `observeOnboarding(userId, cb)` → realtime updates
