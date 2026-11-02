import React from "react";
import GenericModal from "./GenericModal";
import GenericButton from "./GenericButton";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <GenericModal
      visible={visible}
      title={title}
      onClose={isLoading ? () => {} : onCancel}
      size="sm"
      backdrop={isLoading ? "static" : true}
      footer={
        <>
          <GenericButton
            label="Cancelar"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          />
          <GenericButton
            label={isLoading ? "Procesando..." : confirmLabel}
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
          />
        </>
      }
    >
      {message}
    </GenericModal>
  );
}
