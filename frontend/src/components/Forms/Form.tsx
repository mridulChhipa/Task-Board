import type { FormHTMLAttributes, ReactNode } from 'react';
import styles from './form.module.css';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

const Form = ({ children, className, ...props }: FormProps) => {
  return (
    <form className={`${styles.form} ${className ?? ''}`} {...props}>
      {children}
    </form>
  );
};

interface FormControlProps {
  type?: 'text' | 'number' | 'checkbox' | string;
  name: string;
  id?: string;
  placeholder?: string;
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  checked?: boolean;
}

export function FormControl({
  type = 'text',
  name,
  id,
  placeholder,
  value,
  onChange,
  checked = false,
  required = false,
}: FormControlProps) {
  const isCheckbox = type === 'checkbox';

  return (
    <input
      type={type}
      name={name}
      id={id ?? name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      checked={isCheckbox ? checked : undefined}
      className={styles.formControl}
    />
  );
}

interface TextAreaControlProps {
  name: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

export function TextAreaControl({
  name,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 4,
}: TextAreaControlProps) {
  return (
    <textarea
      name={name}
      id={id ?? name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      className={styles.formControl}
    />
  );
}

interface LabelProps {
  children: ReactNode;
  htmlFor: string;
}
3;
export function Label({ children, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
    </label>
  );
}

interface InputAreaProps {
  children: ReactNode;
}

export function InputArea({ children }: InputAreaProps) {
  return <div className={styles.inputArea}>{children}</div>;
}

export default Form;
