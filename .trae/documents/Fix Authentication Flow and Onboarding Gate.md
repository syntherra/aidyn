# Root Cause
- The current "Sign In" button sets a local `success=true` after a timeout without validating credentials. This bypasses authentication and routes all users to onboarding regardless of account status.

# Objectives
1. Implement real authentication for Sign Up and Sign In (email/password + Google).
2. Gate onboarding strictly on Firebase Auth state and per-user onboarding document.
3. Provide clear errors, password reset, and persistence handling.
4. Add optional email verification before onboarding.

## Changes (High-Level)
### 1) Authentication APIs
- Use Firebase Auth for email/password:
  - `createUserWithEmailAndPassword(email, password)` → on success: `updateProfile({ displayName: name })`, `ensureUserRecord()`, `getOrCreateOnboarding()`.
  - `signInWithEmailAndPassword(email, password)` → on success: route by onboarding status.
- Google OAuth: keep `signInWithPopup` (already implemented) → same post‑auth steps.
- Persistence:
  - If "Remember Me" checked: `browserLocalPersistence`; else `sessionPersistence`.
- Password Reset:
  - `sendPasswordResetEmail(email)` when "Forgot Password" clicked.

### 2) UI Logic Rework
- Remove local `success` flips. Success derives only from Auth state.
- Sign Up flow:
  - Validate fields → call Firebase signup → show errors on failure.
- Sign In flow:
  - Validate email + password → call Firebase signin → show errors on failure.
- Feedback:
  - Error banners/messages under fields.
  - Loading indicators during async calls.

### 3) Onboarding Gate
- App routing (hash router):
  - If unauthenticated → SignUpPage.
  - If authenticated → fetch/observe `onboarding/{uid}`.
    - `completion === false` → show OnboardingShell.
    - `completion === true` → show Main App.
- Ensure onboarding doc created at first successful signup/signin via `getOrCreateOnboarding(uid)`.
- Optional: require `user.emailVerified` before onboarding (send verification email if not verified).

### 4) Security Rules & Data Integrity
- Rules already restrict `onboarding/{uid}` to owner; keep as is.
- Validation client side:
  - Email format, password length ≥8, strong password guidance.
  - Sanitization of text inputs before storing in `steps`.
- Audit logs:
  - Log successful/failed auth events via `logApp` with `logLevel` (`info`/`error`).

### 5) Error Handling & UX
- Cases:
  - Wrong password / user not found → specific messages.
  - Network issues → retry CTA.
  - Missing onboarding doc → auto-create with defaults.
- Provide `Forgot Password` flow and confirmation state.

### 6) Testing Plan
- Sign Up
  - New email creates `users/{uid}` and `onboarding/{uid}`; routes to onboarding.
- Sign In
  - Wrong creds blocked, correct creds allowed.
  - With `completion=false` → onboarding; `true` → main app.
- Google OAuth
  - Works end-to-end with the same gate.
- Email verification (if enabled)
  - Unverified user sees verification prompt; verified proceeds.

### 7) Documentation
- Update `docs/FIREBASE.md` and `docs/ONBOARDING_DATA_MODEL.md` with auth flow diagrams and onboarding gate description.

## Delivery Steps
1. Replace the local `submit()` with real Firebase `signUp` and `signIn` functions; wire field validations and error messages.
2. Add password reset action from "Forgot Password".
3. Toggle persistence based on "Remember Me".
4. Ensure `getOrCreateOnboarding(uid)` runs after auth; route by `completion`.
5. Add optional email verification gate.
6. Write tests for the scenarios above and verify in the emulator/console.

## Acceptance Criteria
- Users with wrong or unregistered credentials cannot proceed.
- Authenticated users are routed to onboarding only when `completion=false`.
- Main app visible only when `completion=true`.
- Clear errors and password reset available.
- Logs show auth events and onboarding gate decisions.