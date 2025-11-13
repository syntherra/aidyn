import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, browserSessionPersistence, onAuthStateChanged, signInWithPopup, signOut, type User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp, collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, arrayUnion, type Firestore } from 'firebase/firestore'
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics'
import { firebaseConfig } from './config'

let app: FirebaseApp | null = null
let auth: ReturnType<typeof getAuth> | null = null
let db: Firestore | null = null

export const initFirebase = () => {
  if (!app) {
    try {
      if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) throw new Error('Missing Firebase config')
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      db = getFirestore(app)
      setPersistence(auth, browserLocalPersistence)
      ;(async () => { if (await isSupported()) getAnalytics(app!) })()
    } catch (e) {
      // keep modules null; callers must guard
      app = null
      auth = null
      db = null
    }
  }
  return { app, auth, db }
}

export const signInWithGoogle = async () => {
  initFirebase()
  const provider = new GoogleAuthProvider()
  try {
    if (!auth || !app) throw new Error('Firebase not initialized')
    const res = await signInWithPopup(auth, provider)
    const u = res.user
    await ensureUserRecord(u)
    await logActivity(u.uid, 'sign_in', { provider: 'google' })
    await logApp('info', 'auth_success', u.uid, 'auth')
    if (await isSupported()) logEvent(getAnalytics(app!), 'login', { method: 'Google' })
    return u
  } catch (err: any) {
    await logApp('error', String(err?.message || err), auth?.currentUser?.uid, 'auth')
    throw err
  }
}

export const doSignOut = async () => {
  initFirebase()
  const uid = auth?.currentUser?.uid
  try {
    if (!auth || !app) throw new Error('Firebase not initialized')
    await signOut(auth)
    if (uid) await logActivity(uid, 'sign_out')
    if (await isSupported()) logEvent(getAnalytics(app!), 'logout')
  } catch (err: any) {
    await logApp('error', String(err?.message || err), uid, 'auth')
    throw err
  }
}

export const onAuth = (cb: (u: User | null) => void) => {
  initFirebase()
  if (!auth) { cb(null); return () => {} }
  return onAuthStateChanged(auth, cb)
}

export const ensureUserRecord = async (u: User) => {
  initFirebase()
  if (!db) return
  const ref = doc(db, 'users', u.uid)
  const payload = {
    uid: u.uid,
    email: u.email || '',
    displayName: u.displayName || '',
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    authProvider: 'google',
  }
  try { await setDoc(ref, payload, { merge: true }) } catch (err: any) { await logApp('error', String(err?.message || err), u.uid, 'users') }
}

export const logActivity = async (userId: string, actionType: string, metadata: Record<string, any> = {}) => {
  initFirebase()
  try {
    if (!db) return
    await addDoc(collection(db, 'user_activities'), { userId, actionType, timestamp: serverTimestamp(), metadata })
  } catch (err: any) {
    await logApp('error', String(err?.message || err), userId, 'activities')
  }
}

export const logApp = async (logLevel: string, message: string, userId?: string, source?: string) => {
  initFirebase()
  try {
    if (!db) return
    await addDoc(collection(db, 'app_logs'), { userId: userId || null, logLevel, message, timestamp: serverTimestamp(), source: source || 'app' })
  } catch {}
}

export const listenUserActivities = (userId: string, cb: (items: any[]) => void) => {
  initFirebase()
  if (!db) { cb([]); return () => {} }
  const q = query(collection(db, 'user_activities'), where('userId', '==', userId), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
// Onboarding session APIs
export const startOnboardingSession = async (userId: string) => {
  initFirebase()
  try {
    if (!db) return null
    const ref = await addDoc(collection(db, 'onboarding_sessions'), {
      userId,
      startedAt: serverTimestamp(),
      currentStage: 'identity',
      completion: 0,
      confidence: 0,
      lastUpdated: serverTimestamp(),
    })
    return ref.id
  } catch (e) { await logApp('error', 'start_onboarding_failed', userId, 'onboarding') ; return null }
}

export const saveOnboardingAnswer = async (sessionId: string, stage: string, text: string, structured: Record<string, any>, scores: { depth: number; specificity: number; confidence: number }) => {
  initFirebase()
  try {
    if (!db) return
    await addDoc(collection(db, 'onboarding_answers'), {
      sessionId,
      stage,
      text,
      structured,
      depthScore: scores.depth,
      specificityScore: scores.specificity,
      confidence: scores.confidence,
      createdAt: serverTimestamp(),
    })
  } catch (e) { /* log suppressed */ }
}
// Onboarding single-document model: doc id = uid
export const getOrCreateOnboarding = async (userId: string) => {
  initFirebase()
  try {
    if (!db) return null
    const ref = doc(db, 'onboarding', userId)
    await setDoc(ref, { userId, completion: false, lastUpdated: serverTimestamp(), progress: {}, steps: {} }, { merge: true })
    return ref
  } catch (e) { await logApp('error', 'onboarding_init_failed', userId, 'onboarding'); return null }
}

export const updateOnboarding = async (userId: string, patch: any) => {
  initFirebase(); if (!db) return
  const ref = doc(db, 'onboarding', userId)
  try { await setDoc(ref, { ...patch, userId, lastUpdated: serverTimestamp() }, { merge: true }) } catch (e) { await logApp('error', 'onboarding_update_failed', userId, 'onboarding') }
}

export const observeOnboarding = (userId: string, cb: (data: any | null) => void) => {
  initFirebase(); if (!db) { cb(null); return () => {} }
  const ref = doc(db, 'onboarding', userId)
  return onSnapshot(ref, (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null))
}

export const appendConversation = async (userId: string, entry: { role: 'user' | 'assistant'; text: string; stage?: string; ts: string }) => {
  initFirebase(); if (!db) return
  const ref = doc(db, 'onboarding', userId)
  try { await updateDoc(ref, { conversation: arrayUnion(entry), userId, lastUpdated: serverTimestamp() }) } catch (e) { await logApp('error', 'onboarding_conversation_append_failed', userId, 'onboarding') }
}

export const updateOnboardingStage = async (userId: string, stage: string, bump: number, text: string, score?: number) => {
  initFirebase(); if (!db) return
  const ref = doc(db, 'onboarding', userId)
  const payload: any = { userId, lastUpdated: serverTimestamp() }
  payload[`progress.${stage}`] = bump
  payload[`steps.${stage}.text`] = text
  if (typeof score === 'number') payload['score'] = score
  try { await updateDoc(ref, payload) } catch (e) { await logApp('error', 'onboarding_stage_update_failed', userId, 'onboarding') }
}

export const setActiveSession = async (userId: string, sessionId: string) => {
  initFirebase(); if (!db) return
  const ref = doc(db, 'onboarding', userId)
  try { await updateDoc(ref, { activeSessionId: sessionId, userId, lastUpdated: serverTimestamp() }) } catch (e) { await logApp('error', 'set_active_session_failed', userId, 'onboarding') }
}

export const appendSessionMessage = async (sessionId: string, entry: { role: 'user' | 'assistant'; text: string; stage?: string; ts: string }) => {
  initFirebase(); if (!db) return
  try { await addDoc(collection(db, 'onboarding_sessions', sessionId, 'messages'), entry) } catch (e) { /* suppressed */ }
}

export const observeSessionMessages = (sessionId: string, cb: (items: { role: 'user' | 'assistant'; text: string; stage?: string; ts: string }[]) => void) => {
  initFirebase(); if (!db) { cb([]); return () => {} }
  const q = query(collection(db, 'onboarding_sessions', sessionId, 'messages'), orderBy('ts', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => d.data() as any)))
}
export const setAuthPersistenceMode = async (remember: boolean) => {
  initFirebase(); if (!auth) throw new Error('Firebase not initialized')
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
}

export const signUpWithEmail = async (email: string, password: string, displayName?: string, remember = false) => {
  initFirebase(); if (!auth || !app) throw new Error('Firebase not initialized')
  await setAuthPersistenceMode(remember)
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) await updateProfile(res.user, { displayName })
    await ensureUserRecord(res.user)
    await getOrCreateOnboarding(res.user.uid)
    await logActivity(res.user.uid, 'sign_up', { provider: 'password' })
    await logApp('info', 'signup_success', res.user.uid, 'auth')
    return res.user
  } catch (err: any) {
    await logApp('error', String(err?.message || err), auth?.currentUser?.uid, 'auth')
    throw err
  }
}

export const signInWithEmail = async (email: string, password: string, remember = false) => {
  initFirebase(); if (!auth || !app) throw new Error('Firebase not initialized')
  await setAuthPersistenceMode(remember)
  try {
    const res = await signInWithEmailAndPassword(auth, email, password)
    await logActivity(res.user.uid, 'sign_in', { provider: 'password' })
    await logApp('info', 'signin_success', res.user.uid, 'auth')
    await getOrCreateOnboarding(res.user.uid)
    return res.user
  } catch (err: any) {
    await logApp('error', String(err?.message || err), auth?.currentUser?.uid, 'auth')
    throw err
  }
}

export const resetPassword = async (email: string) => {
  initFirebase(); if (!auth) throw new Error('Firebase not initialized')
  try { await sendPasswordResetEmail(auth, email) } catch (e) { await logApp('error', 'reset_password_failed', auth?.currentUser?.uid, 'auth'); throw e }
}
