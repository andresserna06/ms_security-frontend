import React, { useCallback, useEffect, useState } from "react";
import { Permission } from "../../models/Permission";
import { IPermissionService } from "../../services/interfaces/IPermissionService";
import GenericTable, { TableColumn, TableAction } from "../../components/common/GenericTable";
import GenericButton from "../../components/common/GenericButton";
import GenericModal from "../../components/common/GenericModal";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import PermissionForm from "./PermissionForm";

interface PermissionsProps {
  permissionService: IPermissionService;
}

export default function Permissions({ permissionService }: PermissionsProps) {
  const [permissions, setPermissions] = useState<Permission[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await permissionService.getAll();
    if (result === null) {
      setError("No fue posible obtener la lista de permisos.");
    }
    setPermissions(result);
    setIsLoading(false);
  }, [permissionService]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const openCreateModal = () => {
    setSelectedPermission(null);
    setModalVisible(true);
    clearMessages();
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(new Permission(permission));
    setModalVisible(true);
    clearMessages();
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalVisible(false);
    setSelectedPermission(null);
  };

  const handleSubmit = async (permissionToSave: Permission) => {
    setIsSaving(true);
    clearMessages();

    const isEditing = permissionToSave.id > 0;
    const saved = isEditing
      ? await permissionService.update(permissionToSave.id, permissionToSave)
      : await permissionService.create(permissionToSave);

    if (saved === null) {
      setError(isEditing ? "No fue posible actualizar el permiso." : "No fue posible crear el permiso.");
    } else {
      setSuccess(isEditing ? "Permiso actualizado correctamente." : "Permiso creado correctamente.");
      setModalVisible(false);
      setSelectedPermission(null);
      await fetchPermissions();
    }

    setIsSaving(false);
  };

  const handleDelete = async (permission: Permission) => {
    const confirmed = window.confirm(
      `¿Eliminar el permiso "${permission.method} ${permission.url}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    clearMessages();
    const deleted = await permissionService.remove(permission.id);
    if (deleted === true) {
      setSuccess("Permiso eliminado correctamente.");
      await fetchPermissions();
    } else {
      setError("No fue posible eliminar el permiso.");
    }
  };

  const columns: TableColumn<Permission>[] = [
    { header: "ID", accessor: "id" },
    { header: "Método", accessor: "method" },
    { header: "URL", accessor: "url" },
    { header: "Modelo", accessor: "model" },
  ];

  const actions: TableAction<Permission>[] = [
    {
      label: "Editar",
      variant: "outline-secondary",
      onClick: (permission: Permission) => openEditModal(permission),
    },
    {
      label: "Eliminar",
      variant: "outline-danger",
      onClick: (permission: Permission) => handleDelete(permission),
    },
  ];

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">Gestión de Permisos</h2>
        <GenericButton label="Nuevo Permiso" variant="primary" onClick={openCreateModal} />
      </div>

      {error ? <Alert type="danger" message={error} onClose={() => setError(null)} /> : null}
      {success ? <Alert type="success" message={success} onClose={() => setSuccess(null)} /> : null}

      {isLoading ? (
        <Loader text="Cargando permisos..." />
      ) : (
        <GenericTable<Permission>
          data={permissions}
          columns={columns}
          actions={actions}
          getKey={(permission) => permission.id}
          isLoading={false}
          emptyMessage="No hay permisos registrados"
          errorMessage="No fue posible obtener la lista de permisos."
        />
      )}

      <GenericModal
        visible={modalVisible}
        title={selectedPermission ? "Editar Permiso" : "Crear Permiso"}
        onClose={closeModal}
        size="lg"
      >
        <PermissionForm
          initialPermission={selectedPermission}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSaving={isSaving}
        />
      </GenericModal>
    </div>
  );
}
