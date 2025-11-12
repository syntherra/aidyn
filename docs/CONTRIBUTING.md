# Contributing

## Workflow
- Use feature branches per module (e.g., `feat/onboarding`, `feat/campaigns`)
- Open PRs with tests and descriptions; adhere to Conventional Commits

## Standards
- TypeScript strict typing; ESLint + Prettier
- Unit/E2E tests; keep serverless functions small and single-responsibility

## Code Review
- CI must pass (lint, tests, build)
- Request reviews from module owners where applicable

## Releases
- Merge to `main` via PR; GitHub Actions handle deploy to Netlify/Firebase

