# Root Cause
The SignUpPage sets a local `success=true` and renders OnboardingShell directly (AnimatePresence), bypassing real authentication. Any input can flip `success` and show onboarding.

# Fix Plan
## 1) Remove Local Bypass
- Delete AnimatePresence/OnboardingShell render from SignUpPage.
- Remove `success` flag from SignUpPage and its usage.
- Keep SignUpPage strictly as a credential form.

## 2) Implement Real Auth Calls
- Sign Up: call `createUserWithEmailAndPassword(email, password)`, then `updateProfile({ displayName: name })`, `ensureUserRecord(uid)`, `getOrCreateOnboarding(uid)`.
- Sign In: call `signInWithEmailAndPassword(email, password)`.
- Toggle persistence: if "Remember Me" checked, set `browserLocalPersistence`, else `sessionPersistence`.
- Errors: display Firebase error codes under inputs (user-not-found, wrong-password, email-already-in-use, weak-password).
- Forgot Password: `sendPasswordResetEmail(email)`.

## 3) Gate Onboarding at App Level
- Use App.tsx routing (already present):
  - unauthenticated → SignUpPage
  - authenticated + onboarding.completion=false → OnboardingShell
  - authenticated + onboarding.completion=true → Main App
- Ensure `getOrCreateOnboarding(uid)` on login so the doc exists.

## 4) QA
- Try random creds on Sign In: expect error and stay on SignUpPage.
- Valid creds: proceed to onboarding (completion=false) or main app (completion=true).
- Google OAuth continues to work through the same gate.

## 5) Optional
- Email verification gate before onboarding.

## Deliverables
- Updated SignUpPage with real auth and error handling.
- Removed local success-based onboarding render.
- Verified flow with test scenarios.