import styles from "./FormControl.module.css";

interface TextAreaControlProps {
  name: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
};

export default function TextAreaControl({
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