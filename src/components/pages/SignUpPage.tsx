import React, { useState, useEffect } from "react";
import styles from "./SignUpPage.module.scss";
import Input from "../ui/Input";
import { Mail, User, Lock } from "lucide-react";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";
import OAuthButton from "../ui/OAuthButton";
import { Chrome, Github } from "lucide-react";
import PasswordStrength from "../ui/PasswordStrength";
import TextCarousel from "../ui/TextCarousel";
import { validateEmail, passwordScore, passwordLabel } from "../../utils/validation";
import { initFirebase, signInWithGoogle, doSignOut, onAuth, signUpWithEmail, signInWithEmail, resetPassword } from "../../firebase";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [banner, setBanner] = useState<string | null>(null);
  const score = passwordScore(password);
  const label = passwordLabel(score);
  const [authed, setAuthed] = useState<boolean>(false);
  useEffect(() => {
    initFirebase();
    const unsub = onAuth((u) => setAuthed(!!u));
    return () => unsub();
  }, []);

  const submit = async () => {
    const e: { name?: string; email?: string; password?: string } = {};
    if (mode === "signup") {
      if (!name.trim()) e.name = "Please enter your full name";
      if (!validateEmail(email)) e.email = "Please enter a valid email";
      if (password.length < 8) e.password = "Password must be at least 8 characters";
    } else {
      if (!validateEmail(email)) e.email = "Please enter a valid email";
      if (!password) e.password = "Please enter your password";
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setBanner(null);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name, remember);
      } else {
        await signInWithEmail(email, password, remember);
      }
    } catch (err: any) {
      const msg = String(err?.code || err?.message || "").replace("Firebase:", "").trim();
      const friendly = ((): string => {
        const c = msg.toLowerCase();
        if (c.includes('auth/invalid-credential') || c.includes('auth/user-not-found')) return "Sorry, looks like this account doesn't exist";
        if (c.includes('auth/wrong-password')) return "Incorrect email or password";
        if (c.includes('auth/invalid-email')) return "Please enter a valid email address";
        if (c.includes('auth/email-already-in-use')) return "An account with this email already exists";
        if (c.includes('auth/weak-password')) return "Please choose a stronger password (8+ characters)";
        if (c.includes('auth/too-many-requests')) return "Too many attempts. Please try again later";
        if (c.includes('network')) return "Network error. Check your connection and try again";
        return "Something went wrong. Please try again";
      })();
      setBanner(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.left}>
          <img className={styles.logo} src="/assets/Vector.svg" alt="AIDYN logo" />
          <img className={styles.graphic} src="/assets/Group 200.svg" alt="Geometric graphic" />
          <div className={styles.bottom}>
            <TextCarousel
              messages={[
                "Meet AIDYN — your AI-powered business development partner.\nDiscover, engage, and grow clients on autopilot.",
                "Stop chasing leads.\nAIDYN finds them, contacts them, and keeps your CRM up to date.",
                "From strategy to inbox, AIDYN handles every step of lead generation.\nYou focus on what matters most — your business.",
                "An entire sales and lead‑gen team, in one intelligent platform.\nAlways learning. Always working. Always on.",
                "Let AIDYN grow your database while you sleep.\nSmarter outreach. Cleaner CRM. Better results.",
                "Build relationships, not spreadsheets.\nAIDYN handles the data, the emails, and the follow‑ups.",
                "AI‑driven lead generation for founders, freelancers, and small teams.\nProfessional results. Zero effort.",
                "Turn chaos into clarity.\nAIDYN organizes your leads and learns from every reply.",
                "Lead generation that feels human — powered by AI.\nPersonalized outreach. Dynamic CRM. Real conversations.",
                "Forget the manual work.\nAIDYN finds your next client, writes the email, and keeps the pipeline alive.",
              ]}
              intervalMs={5000}
              transitionMs={400}
            />
          </div>
        </div>
        <div className={styles.card} role="form" aria-labelledby="signup-title">
          <div className={styles.header}>
            <p id="signup-title" className={styles.title}>{mode === "signup" ? "Create Your Account" : "Sign In"}</p>
            <p className={styles.subtitle}>{mode === "signup" ? "Create your account & unlock your businesses true, automated potential" : "Welcome back. Enter your credentials to continue."}</p>
          </div>
          <div className={styles.dividerThin} />
          {banner && <div className={styles.subtitle} aria-live="assertive" style={{ color: '#d32f2f' }}>{banner}</div>}

          {mode === "signup" ? (
            <>
              <Input id="name" value={name} onChange={setName} placeholder="Your Full Name Here" required ariaLabel="Full name" error={errors.name} icon={User} />
              <Input id="email" value={email} onChange={setEmail} placeholder="Your Email Address" required ariaLabel="Email address" error={errors.email} icon={Mail} />
              <Input id="password" type="password" value={password} onChange={setPassword} placeholder="Your Password" required ariaLabel="Password" error={errors.password} icon={Lock} passwordToggle />
              <PasswordStrength score={score} label={label} />
              <div className={styles.dividerWide} />
              <div className={styles.privacy}>By creating an account, you agree to our <a className={styles.privacyLink} href="#/privacy" aria-label="Privacy Policy">Privacy Policy</a></div>
              <Button onClick={submit} loading={loading} ariaLabel="Sign Up">Sign Up</Button>
              <div className={styles.actions}>
                <Checkbox id="remember" checked={remember} onChange={setRemember} label="Remember Me" />
                <a className={styles.subtitle} href="#" aria-label="Forgot Password" onClick={(e) => { e.preventDefault(); if (validateEmail(email)) resetPassword(email).then(() => setBanner('Password reset email sent')).catch((err) => setBanner(String(err?.message || 'Failed to send reset email'))); else setBanner('Enter a valid email to reset password'); }}>Forgot Password?</a>
              </div>
            </>
          ) : (
            <>
              <Input id="email" value={email} onChange={setEmail} placeholder="Your Email Address" required ariaLabel="Email address" error={errors.email} icon={Mail} />
              <Input id="password" type="password" value={password} onChange={setPassword} placeholder="Your Password" required ariaLabel="Password" error={errors.password} icon={Lock} passwordToggle />
              <div className={styles.actions}>
                <Checkbox id="remember" checked={remember} onChange={setRemember} label="Remember Me" />
                <a className={styles.subtitle} href="#" aria-label="Forgot Password" onClick={(e) => { e.preventDefault(); if (validateEmail(email)) resetPassword(email).then(() => setBanner('Password reset email sent')).catch((err) => setBanner(String(err?.message || 'Failed to send reset email'))); else setBanner('Enter a valid email to reset password'); }}>Forgot Password?</a>
              </div>
              <Button onClick={submit} loading={loading} ariaLabel="Sign In">Sign In</Button>
            </>
          )}

          <div className={styles.dividerWide} />
          <div className={styles.orRow}>
            <div className={styles.line} />
            <span className={styles.orText}>{mode === "signup" ? "Or Sign in with" : "Or continue with"}</span>
            <div className={styles.line} />
          </div>
          <div className={styles.dividerWide} />
          <div className={styles.oauthRow}>
            <OAuthButton provider={authed ? "Sign Out" : "Google"} icon={Chrome} onClick={() => authed ? doSignOut() : signInWithGoogle()} />
            <OAuthButton provider="GitHub" icon={Github} onClick={() => alert('GitHub auth not configured yet')} />
          </div>
          <div className={styles.footerText}>
            {mode === "signup" ? (
              <>Already have an account? <a className={styles.signInLink} href="#" onClick={(e) => { e.preventDefault(); setMode("signin"); setErrors({}); setBanner(null); }}>Sign In</a></>
            ) : (
              <>Don’t have an account? <a className={styles.signInLink} href="#" onClick={(e) => { e.preventDefault(); setMode("signup"); setErrors({}); setBanner(null); }}>Sign Up</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
