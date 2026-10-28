import React from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";

interface GenericModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "xl";
  backdrop?: boolean | "static";
}

export default function GenericModal({
  visible,
  title,
  onClose,
  children,
  footer,
  size = "lg",
  backdrop,
}: GenericModalProps) {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size={size}
      alignment="center"
      backdrop={backdrop}
    >
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{children}</CModalBody>
      {footer ? <CModalFooter>{footer}</CModalFooter> : null}
    </CModal>
  );
}
