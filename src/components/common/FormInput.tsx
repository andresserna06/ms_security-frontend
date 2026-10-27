import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "date";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  className?: string;
}

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = null,
  className = "",
}: FormInputProps) {
  const hasError = Boolean(error);
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={name} className="form-label">
        {label} {required ? <span className="text-danger">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-control ${hasError ? "is-invalid" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      {hasError ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
}
