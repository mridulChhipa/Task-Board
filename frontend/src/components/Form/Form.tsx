import type { FormHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
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

interface FormControlProps extends InputHTMLAttributes<HTMLInputElement> {
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
  ...props
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
      {...props}
    />
  );
}

interface TextAreaControlProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
}

export function TextAreaControl({
  name,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 4,
  ...props
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
      {...props}
    />
  );
}

interface LabelProps {
  children: ReactNode;
  htmlFor: string;
}
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
