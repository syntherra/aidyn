import React from "react";
import { type LucideIcon } from "lucide-react";
import styles from "./OAuthButton.module.scss";

type Props = {
  provider: string;
  onClick?: () => void;
  icon?: LucideIcon;
};

const OAuthButton = ({ provider, onClick, icon: Icon }: Props) => {
  return (
    <button className={styles.root} onClick={onClick} aria-label={`Sign in with ${provider}`}>
      {Icon ? <Icon size={18} strokeWidth={2.2} aria-hidden="true" /> : null}
      {provider}
    </button>
  );
};

export default OAuthButton;
