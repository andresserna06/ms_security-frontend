import React from "react";

interface LoaderProps {
  text?: string;
}

export default function Loader({ text = "Cargando..." }: LoaderProps) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="spinner-border" role="status" aria-hidden="true"></div>
      <span>{text}</span>
    </div>
  );
}
