import React, { useEffect, useMemo, useState } from "react";
import styles from "./OnboardingShell.module.scss";
import Button from "../ui/Button";
import { streamChat, chatOnce } from "../../ai/deepseek";
import { evaluateAnswer, nextPrompt } from "../../onboarding/scoring";
import { updateOnboarding, logApp, updateOnboardingStage, startOnboardingSession, setActiveSession, observeSessionMessages, appendSessionMessage, observeUserMessages, appendUserMessage, doSignOut } from "../../firebase";

type StageKey = "identity" | "product" | "audience" | "positioning" | "sales" | "voice";
const STAGES: StageKey[] = ["identity", "product", "audience", "positioning", "sales", "voice"];

const LABELS: Record<StageKey, string> = {
  identity: "Business Identity",
  product: "Product / Service",
  audience: "Target Audience",
  positioning: "Market Positioning",
  sales: "Sales Objectives",
  voice: "Brand Voice",
};

const OnboardingShell = ({ userId, onboarding }: { userId?: string, onboarding?: any }) => {
  const [stage, setStage] = useState<StageKey>("identity");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Welcome to AIDYN. Let’s start with your Business Identity. Tell me your company name, industry and core values." },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [migrated, setMigrated] = useState<boolean>(false);
  const [progress, setProgress] = useState<Record<StageKey, number>>({ identity: 0, product: 0, audience: 0, positioning: 0, sales: 0, voice: 0 });
  const [score, setScore] = useState<number>(0);
  const overall = useMemo(() => Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / STAGES.length), [progress]);

  useEffect(() => {
    if (onboarding?.progress) {
      setProgress((p) => ({ ...p, ...onboarding.progress }));
    }
    if (onboarding?.steps) {
      const next = STAGES.find((s) => (onboarding.progress?.[s] ?? 0) < 75) || "voice";
      setStage(next);
    }
    if (typeof onboarding?.score === 'number') setScore(onboarding.score);
    if (userId) {
      const existing = onboarding?.activeSessionId as string | undefined;
      if (existing) {
        setSessionId(existing);
      } else {
        (async () => {
          const sid = await startOnboardingSession(userId);
          if (sid) {
            setSessionId(sid);
            await setActiveSession(userId, sid);
          }
        })();
      }
    }
  }, [onboarding, userId]);

  useEffect(() => {
    if (!userId) return;
    const off = observeUserMessages(userId, (items) => {
      if (items && items.length) {
        setHistory(items.map(m => ({ role: m.role, text: m.text })));
      } else {
        const conv = onboarding?.conversation as { role: "user" | "assistant"; text: string }[] | undefined;
        if (Array.isArray(conv) && conv.length) setHistory(conv);
      }
    });
    return () => off();
  }, [userId]);

  useEffect(() => {
    if (!sessionId || migrated) return;
    const legacy = onboarding?.conversation as { role: "user" | "assistant"; text: string; stage?: StageKey; ts?: string }[] | undefined;
    if (Array.isArray(legacy) && legacy.length) {
      (async () => {
        for (let i = 0; i < legacy.length; i++) {
          const e = legacy[i];
          const ts = e.ts || new Date(Date.now() + i).toISOString();
          await appendSessionMessage(sessionId, { role: e.role, text: e.text, stage: e.stage, ts })
          if (userId) await appendUserMessage(userId, { role: e.role, text: e.text, stage: e.stage, ts })
        }
        setMigrated(true);
        if (userId) updateOnboarding(userId, { legacyMigrated: true });
      })();
    }
  }, [sessionId, migrated, onboarding]);

  const send = () => {
    if (!message.trim()) return;
    const timestamp = new Date().toISOString();
    setHistory((h) => [...h, { role: "user", text: message }]);
    if (userId) appendUserMessage(userId, { role: 'user', text: message, stage, ts: timestamp });
    if (sessionId) appendSessionMessage(sessionId, { role: 'user', text: message, stage, ts: timestamp });
    const evalRes = evaluateAnswer(stage, message);
    const newScore = Math.max(0, Math.min(100, score + evalRes.relevance - evalRes.deductions + Math.round(evalRes.specificity / 4)));
    setScore(newScore);
    const inc = Math.min(40, evalRes.progressDelta);
    const bump = Math.min(100, (progress[stage] || 0) + inc);
    setProgress((p) => ({ ...p, [stage]: bump }));
    if (userId) updateOnboardingStage(userId, stage, bump, message, newScore);
    logApp('info', 'onboarding_message', userId || undefined, 'onboarding');
    // Call DeepSeek streaming
    const system = `You are AIDYN’s onboarding assistant. Collect structured data for ${LABELS[stage]}.
Keep responses concise and actionable. Encourage specificity. If off-topic, gently steer back. Ask: ${nextPrompt(stage)}`;
    const msgs = [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: message },
    ] as any;
    let buffer = "";
    streamChat(msgs, (chunk) => {
      buffer += chunk;
      setHistory((h) => {
        const last = h[h.length - 1];
        if (last && last.role === "assistant") {
          const copy = h.slice();
          copy[copy.length - 1] = { role: "assistant", text: last.text + chunk };
          return copy;
        }
        return [...h, { role: "assistant", text: chunk }];
      });
    })
      .then(async () => {
        if (!buffer.trim()) {
          // Fallback to non-stream if streaming produced nothing
          const reply = await chatOnce(msgs as any).catch(() => "")
          if (reply) {
            buffer = reply
            setHistory((h) => [...h, { role: 'assistant', text: reply }])
          }
        }
        if (userId && buffer.trim()) appendUserMessage(userId, { role: 'assistant', text: buffer.trim(), stage, ts: new Date().toISOString() })
        if (sessionId && buffer.trim()) appendSessionMessage(sessionId, { role: 'assistant', text: buffer.trim(), stage, ts: new Date().toISOString() })
        if (bump >= 75) {
          const nextIdx = STAGES.indexOf(stage) + 1;
          if (nextIdx < STAGES.length) {
            const next = STAGES[nextIdx];
            setStage(next);
            setHistory((h) => [...h, { role: "assistant", text: `Now let’s talk about ${LABELS[next]}.` }]);
            updateOnboarding(userId || "", { currentStage: next });
          } else {
            setHistory((h) => [...h, { role: "assistant", text: "Great — you’re ready to proceed." }]);
            updateOnboarding(userId || "", { completion: true });
          }
        }
      })
      .catch((e) => {
        setHistory((h) => [...h, { role: "assistant", text: `I had trouble reaching the AI (${e.message}). Please try again.` }]);
      });
    setMessage("");
  };

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.leftTitle}>{LABELS[stage]}</div>
        <div className={styles.chatArea}>
          <div className={styles.messages}>
            {history.map((m, i) => (
              <p key={i} aria-live="polite"><strong>{m.role === "assistant" ? "AIDYN" : "You"}:</strong> {m.text}</p>
            ))}
          </div>
          <div className={styles.inputRow}>
            <input className={styles.input} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your answer" aria-label="Answer" />
            <Button variant="neutral" ariaLabel="Send" onClick={send}>Send</Button>
          </div>
        </div>
      </div>
      <div className={styles.panel}>
        <div className={styles.kpis}>
          <div className={styles.kpiCard}><strong>Overall</strong><div>{overall}%</div></div>
          <div className={styles.kpiCard}><strong>Status</strong><div>{overall >= 80 ? "Ready" : "In progress"}</div></div>
        </div>
        {STAGES.map((key) => (
          <div key={key} className={styles.progressGroup}>
            <div>{LABELS[key]}</div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${progress[key]}%` }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button variant="neutral" ariaLabel="Clear Data" onClick={() => {
            if (confirm('This will erase your onboarding data. Continue?')) {
              updateOnboarding(userId || '', { progress: {}, steps: {}, completion: false })
              setProgress({ identity: 0, product: 0, audience: 0, positioning: 0, sales: 0, voice: 0 });
              setScore(0);
              setStage('identity');
              setHistory([{ role: 'assistant', text: 'Data cleared. Let’s restart with your Business Identity.' }]);
              logApp('info', 'onboarding_cleared', userId || undefined, 'onboarding');
            }
          }}>Clear Data</Button>
          <Button variant="neutral" ariaLabel="Log Out" onClick={() => { doSignOut() }}>Log Out</Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingShell;
