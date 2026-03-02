import styles from "./Button.module.css";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  priority?: "first" | "second" | "third";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
};

function Button({
  children,
  priority = "third",
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[priority]}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

export default Button;
