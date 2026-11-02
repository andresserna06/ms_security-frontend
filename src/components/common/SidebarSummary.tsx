import React from "react";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";

export type ThemeColor = "primary" | "success" | "info" | "warning" | "danger" | "secondary";

interface SidebarSummaryProps {
  title: string;
  color?: ThemeColor;
  children: React.ReactNode;
}

export default function SidebarSummary({ title, color = "primary", children }: SidebarSummaryProps) {
  return (
    <CCard className={`h-100 shadow-sm bg-body border-top-${color} border-top-3`}>
      <CCardHeader className={`bg-${color}-subtle text-${color}-emphasis`}>
        <strong>{title}</strong>
      </CCardHeader>
      <CCardBody>{children}</CCardBody>
    </CCard>
  );
}