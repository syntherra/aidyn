# Deployment & CI/CD

## Hosting
- Frontend: Netlify (Next.js static/serverless)
- Backend: Firebase Cloud Functions (Node 18)

## CI/CD
- GitHub Actions for lint, test, build, deploy
- Branching per module; protected `main`

## Firebase
- Deploy: `firebase deploy --only functions,firestore,storage`
- Monitor in Firebase Console; Sentry for error tracking

## Netlify
- Connect repo; configure build command (`pnpm build`) and output
- Env vars: mirror `NEXT_PUBLIC_*` keys

## BigQuery
- Datasets for `events` analytics
- Scheduled exports or streaming from functions

