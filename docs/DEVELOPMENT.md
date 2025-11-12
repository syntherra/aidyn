# Development Setup

## Prerequisites
- Node.js 18+
- pnpm or npm
- Firebase CLI (`npm i -g firebase-tools`)
- Google Cloud SDK (for BigQuery)
- Netlify CLI (optional for local frontend proxy)

## Project Structure (expected)
- `apps/web` — Next.js frontend
- `apps/functions` — Firebase Cloud Functions (TypeScript)
- `packages/*` — shared libs (types, utils)

Adjust paths as needed if your repo differs.

## Environment Configuration
Create `apps/web/.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

Local dev secrets (store securely):
- `OPENAI_API_KEY` (backend via Secrets Manager)
- `SENDGRID_API_KEY` (backend via Secrets Manager)
- `STRIPE_SECRET_KEY` (backend via Secrets Manager)

## Firebase Setup
- Login: `firebase login`
- Set project: `firebase use <projectId>`
- Emulators: `firebase emulators:start --only firestore,functions`
- Functions config via Secrets Manager; avoid plaintext `.env` in functions

## Running Locally
- Frontend: `pnpm --filter web dev`
- Backend: `pnpm --filter functions dev` or `firebase emulators:start`
- Open `http://localhost:3000` (web) and emulator UI per Firebase output

## Coding Standards
- TypeScript strict mode
- E2E and unit tests (Vitest/Jest)
- Linting: ESLint + Prettier
- Commit format: Conventional Commits

## Data and Events
- Use Firestore collections: `workspaces`, `companies`, `contacts`, `campaigns`, `messages`, `events`
- Emit analytics events to BigQuery via scheduled/export functions

