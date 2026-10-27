import React from "react";

interface AlertProps {
  type?: "success" | "danger" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export default function Alert({ type = "danger", message, onClose }: AlertProps) {
  return (
    <div className={`alert alert-${type} d-flex justify-content-between align-items-center`} role="alert">
      <span>{message}</span>
      {onClose ? (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      ) : null}
    </div>
  );
}
