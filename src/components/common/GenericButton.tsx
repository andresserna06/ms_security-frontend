import React from "react";

interface GenericButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "outline-primary" | "outline-secondary" | "outline-danger" | "outline-success" | "outline-info" | "outline-warning";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function GenericButton({
  label,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: GenericButtonProps) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}
