import React from "react";
import { CButton } from "@coreui/react";
import GenericModal from "../../components/common/GenericModal";
import { User } from "../../models/User";
import { serviceContainer } from "../../services/serviceContainer";
import UserRolesManager from "./UserRolesManager";

interface UserRolesModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onRolesUpdated: () => void;
}

export default function UserRolesModal({
  visible,
  user,
  onClose,
  onRolesUpdated,
}: UserRolesModalProps) {
  return (
    <GenericModal
      visible={visible}
      title={`Gestionar Roles — ${user?.name ?? ""}`}
      onClose={onClose}
      size="lg"
      backdrop="static"
      footer={
        <CButton color="secondary" onClick={onClose}>
          Cerrar
        </CButton>
      }
    >
      {user ? (
        <UserRolesManager
          key={`${user.id}-${visible}`}
          user={user}
          service={serviceContainer.userRoleService}
          onRolesUpdated={onRolesUpdated}
        />
      ) : null}
    </GenericModal>
  );
}
