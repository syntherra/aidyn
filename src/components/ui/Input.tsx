import React, { useState } from "react";
import { type LucideIcon, Eye, EyeOff } from "lucide-react";
import styles from "./Input.module.scss";

type Props = {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  ariaLabel?: string;
  error?: string;
  icon?: LucideIcon;
  passwordToggle?: boolean;
};

const Input = ({ id, type = "text", value, onChange, placeholder, required, ariaLabel, error, icon: Icon, passwordToggle }: Props) => {
  const describedBy = error ? `${id}-error` : undefined;
  const [show, setShow] = useState(false);
  const inputType = type === "password" && show ? "text" : type;
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.field} ${error ? styles.error : ""}`}> 
        {Icon ? <Icon className={styles.icon} aria-hidden="true" size={20} strokeWidth={2.6} /> : null}
        <input
          id={id}
          className={styles.input}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          required={required}
        />
        {type === "password" && passwordToggle ? (
          <button
            type="button"
            className={styles.endIcon}
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
          >
            {show ? <EyeOff size={20} strokeWidth={2.6} /> : <Eye size={20} strokeWidth={2.6} />}
          </button>
        ) : null}
      </div>
      {error ? (
        <span id={describedBy} role="alert" className={styles.errorText}>{error}</span>
      ) : null}
    </div>
  );
};

export default Input;
