import React, { useMemo, useState } from "react";
import styles from "./ProgressDashboard.module.scss";

type Category = {
  label: string;
  color: string;
  value: number;
};

type Props = {
  overall: number;
  size?: number;
  thickness?: number;
  gap?: number;
  categories: Category[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const ProgressDashboard = ({ overall, size = 370, thickness = 16, gap = 16, categories }: Props) => {
  const data = useMemo(() => categories.map(c => ({ ...c, value: clamp(c.value) })), [categories]);
  const center = size / 2;
  const [active, setActive] = useState<number | null>(null);

  let radius = center - thickness / 2;
  const rings = data.map((c, i) => {
    const circ = 2 * Math.PI * radius;
    const dash = (c.value / 100) * circ;
    const offset = circ - dash;
    const el = (
      <g key={c.label} transform={`rotate(-90 ${center} ${center})`} aria-label={`${c.label} ${c.value}%`}>
        <circle cx={center} cy={center} r={radius} stroke="#3e3e3e" strokeWidth={thickness} fill="none" className={styles.track} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={c.color}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          className={`${styles.ring} ${active !== null && active !== i ? styles.inactive : ""}`}
        >
          <title>{`${c.label}: ${c.value}%`}</title>
        </circle>
      </g>
    );
    radius -= thickness + gap;
    return el;
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.radial} style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg} role="img" aria-label="Onboarding progress">
          {rings}
        </svg>
        <div className={styles.center}>
          <div className={styles.value}>{clamp(overall)}%</div>
          <div className={styles.title}>Progress</div>
        </div>
      </div>
      <div className={styles.legend} aria-label="Progress categories">
        {data.map((c, i) => (
          <div key={c.label} className={styles.item} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className={styles.dot} style={{ background: c.color }} />
            <div className={styles.label}>{c.label}</div>
            <div className={styles.pct}>{c.value}%</div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${c.value}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressDashboard;
