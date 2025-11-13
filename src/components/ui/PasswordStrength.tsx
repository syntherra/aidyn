import React from "react";
import styles from "./PasswordStrength.module.scss";

type Props = {
  score: number;
  label: string;
};

const PasswordStrength = ({ score, label }: Props) => {
  const pct = Math.min(100, Math.max(0, score * 20));
  const color = score <= 1 ? "#bbbbbb" : score <= 3 ? "#ff772d" : "#2ecc71";
  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default PasswordStrength;
