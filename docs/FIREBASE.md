# Firebase Integration

## Setup
- Create a Firebase project and register a Web app.
- Enable Authentication → Google provider.
- Enable Firestore (Production mode recommended).
- Optional: enable Analytics and copy `measurementId`.

## Env Variables
Create `.env.local` and set:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

## Collections
- `users` (doc id = `uid`): `uid`, `email`, `displayName`, `createdAt`, `lastLogin`, `authProvider`
- `user_activities`: `userId`, `actionType`, `timestamp`, `metadata`
- `app_logs`: `userId?`, `logLevel`, `message`, `timestamp`, `source`

## Security Rules
See `firestore.rules`. Summary:
- Users read/write only their own `users/{uid}` document.
- `user_activities`: user can create and read their own entries.
- `app_logs`: any authed user can write; reads restricted.

## Indexes
See `firestore.indexes.json`.
- Composite indexes for `user_activities` and `app_logs` by `userId` + `timestamp`.

## Code Modules
- `src/firebase/index.ts`: init, auth, logging, activity helpers, realtime listeners.
- `src/hooks/useUserActivities.ts`: example realtime subscription.

## Analytics
- Auto logs `login` and `logout` if Analytics is supported.

## Common Queries
- Get activities for current user ordered by time.
- Write log: `logApp('info', 'message', uid, 'source')`.

## Security Considerations
- Do not store raw tokens; use Firebase Auth and `browserLocalPersistence`.
- Avoid exposing logs publicly; reads restricted in rules.
- Validate all writes server-side when moving to production Cloud Functions.

