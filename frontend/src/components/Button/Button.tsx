import styles from './Button.module.css';
import type { ReactNode } from 'react';

interface ButtonProps {
  children?: ReactNode;
  priority?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  size?: string;
}

function Button({
  size = 'medium',
  children,
  priority = 'first',
  type,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[size]} ${styles[priority]}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

export default Button;
