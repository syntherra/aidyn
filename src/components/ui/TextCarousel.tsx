import React, { useEffect, useRef, useState } from "react";
import styles from "./TextCarousel.module.scss";

type Props = {
  messages: string[];
  intervalMs?: number;
  transitionMs?: number;
};

const TextCarousel = ({ messages, intervalMs = 5000, transitionMs = 400 }: Props) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (paused || messages.length <= 1) return;
    timer.current && window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      set((index + 1) % messages.length);
    }, intervalMs);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [paused, messages.length, intervalMs]);

  // Fade-in visibility toggle
  const [visible, setVisible] = useState(true);

  const set = (i: number) => {
    setVisible(false);
    const delay = Math.max(50, Math.floor((transitionMs ?? 400) / 2));
    window.setTimeout(() => {
      setIndex(i % messages.length);
      setVisible(true);
    }, delay);
  };

  return (
    <div
      className={styles.root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Marketing messages"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.viewport} aria-live="polite">
        <p
          key={index}
          className={`${styles.message} ${visible ? styles.show : ""}`}
          aria-label={`Slide ${index + 1} of ${messages.length}`}
          style={{ transitionDuration: `${transitionMs}ms` }}
        >
          {messages[index].replace(/\s+/g, " ")}
        </p>
      </div>
      <div className={styles.controls}>
        <div className={styles.dots}>
          {messages.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => set(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <noscript>
        <p>{messages[0]}</p>
      </noscript>
    </div>
  );
};

export default TextCarousel;
