import React from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import GenericButton from "./GenericButton";

interface GenericModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "xl";
}

export default function GenericModal({
  visible,
  title,
  onClose,
  children,
  footer,
  size = "lg",
}: GenericModalProps) {
  return (
    <CModal visible={visible} onClose={onClose} size={size} alignment="center">
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{children}</CModalBody>
      {footer ? <CModalFooter>{footer}</CModalFooter> : null}
    </CModal>
  );
}
