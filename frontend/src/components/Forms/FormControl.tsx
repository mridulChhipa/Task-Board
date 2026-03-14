import styles from "./FormControl.module.css";

interface FormControlProps {
  type?: string;
  name: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export default function FormControl({
  type = "text",
  name,
  id,
  placeholder,
  value,
  onChange,
  required = false,
}: FormControlProps) {
  return (
    <input
      type={type}
      name={name}
      id={id ?? name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={styles.formControl}
    />
  );
}