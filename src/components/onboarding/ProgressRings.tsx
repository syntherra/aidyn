import React, { useMemo } from "react";
import styles from "./ProgressRings.module.scss";

type Ring = {
  label: string;
  color: string;
  value: number;
};

type Props = {
  size?: number;
  thickness?: number;
  gap?: number;
  rings: Ring[];
  title?: string;
  overall?: number;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const ProgressRings = ({ size = 370, thickness = 22, gap = 12, rings, title = "Progress", overall }: Props) => {
  const data = useMemo(() => rings.map(r => ({ ...r, value: clamp(r.value) })), [rings]);
  const center = size / 2;
  const [active, setActive] = React.useState<number | null>(null);

  let radius = center - thickness / 2; // outermost
  const circles = data.map((r, i) => {
    const c = 2 * Math.PI * radius;
    const dash = (r.value / 100) * c;
    const offset = c - dash;
    const angle = (Math.PI * 2) * (r.value / 100) - Math.PI / 2;
    const ex = center + Math.cos(angle) * radius;
    const ey = center + Math.sin(angle) * radius;
    const el = (
      <g key={r.label} transform={`rotate(-90 ${center} ${center})`} aria-label={`${r.label} ${r.value}%`}>
        <circle cx={center} cy={center} r={radius} stroke="#3e3e3e" strokeWidth={thickness} fill="none" className={styles.track} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={r.color}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          className={`${styles.ring} ${active !== null && active !== i ? styles.inactive : ""}`}
        >
          <title>{`${r.label}: ${r.value}%`}</title>
        </circle>
        <circle cx={ex} cy={ey} r={thickness / 4} fill={r.color} className={styles.endpoint} />
      </g>
    );
    radius -= thickness + gap;
    return el;
  });

  return (
    <div style={{ width: size, height: size }} className={styles.wrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg} role="img" aria-label={title}>
        {circles}
      </svg>
      <div className={styles.centerLabel} style={{ width: size, height: size }}>
        <div className={styles.centerValue}>{typeof overall === "number" ? `${clamp(overall)}%` : ""}</div>
        <div className={styles.centerTitle}>{title}</div>
      </div>
      <div className={styles.legend} aria-label="Progress legend">
        {data.map((r, i) => (
          <div key={r.label} className={styles.legendItem} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className={`${styles.dot}`} style={{ background: r.color }} />
            <span>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressRings;
