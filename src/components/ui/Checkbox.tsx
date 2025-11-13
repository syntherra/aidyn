import React from "react";
import styles from "./Checkbox.module.scss";

type Props = {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
};

const Checkbox = ({ id, checked, onChange, label }: Props) => {
  return (
    <label htmlFor={id} className={styles.root}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-checked={checked}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      <span className={styles.box}>{checked ? "✓" : ""}</span>
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default Checkbox;

