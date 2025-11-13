import React, { useEffect, useState } from 'react'
import SignUpPage from './components/pages/SignUpPage'
import PrivacyPolicy from './components/pages/PrivacyPolicy'
import OnboardingShell from './components/onboarding/OnboardingShell'
import { onAuth } from './firebase'
import { observeOnboarding, getOrCreateOnboarding } from './firebase'

function App() {
  const getRoute = () => (window.location.hash.replace('#', '') || '/');
  const [route, setRoute] = useState<string>(getRoute());
  const [uid, setUid] = useState<string | null>(null)
  const [onboarding, setOnboarding] = useState<any | null>(null)

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const unsub = onAuth(async (u) => {
      setUid(u?.uid ?? null)
      if (u?.uid) {
        await getOrCreateOnboarding(u.uid)
        const off = observeOnboarding(u.uid, setOnboarding)
        return () => off()
      } else {
        setOnboarding(null)
      }
    })
    return () => { unsub && unsub() }
  }, [])

  if (route === '/privacy') return <PrivacyPolicy />;
  if (uid && onboarding && onboarding.completion === true) return <div style={{ padding: 24 }}>Main app goes here</div>
  if (uid && onboarding && onboarding.completion === false) return <OnboardingShell userId={uid} onboarding={onboarding} />
  return <SignUpPage />
}

export default App
