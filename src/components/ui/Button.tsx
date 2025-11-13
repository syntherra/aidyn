import React from "react";
import styles from "./Button.module.scss";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "neutral";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

const Button = ({ children, variant = "primary", loading, disabled, onClick, ariaLabel }: Props) => {
  return (
    <button
      className={`${styles.button} ${variant === "primary" ? styles.primary : styles.neutral} ${disabled ? styles.disabled : ""}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;

