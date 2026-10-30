import React, { useCallback, useEffect, useState } from "react";
import { Permission } from "../../models/Permission";
import { Role } from "../../models/Role";
import { IPermissionService } from "../../services/interfaces/IPermissionService";
import GenericTable, { TableColumn, TableAction } from "../../components/common/GenericTable";
import GenericButton from "../../components/common/GenericButton";
import GenericModal from "../../components/common/GenericModal";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import PermissionForm from "./PermissionForm";
import { getPermissionResourceLabel } from "../../utils/permissionMatrix";

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
  const [formError, setFormError] = useState<string | null>(null);

  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [detailPermission, setDetailPermission] = useState<Permission | null>(null);
  const [detailRoles, setDetailRoles] = useState<Role[] | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [deleteRoles, setDeleteRoles] = useState<Role[] | null>(null);
  const [isLoadingDeleteRoles, setIsLoadingDeleteRoles] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    setFormError(null);
  };

  const openCreateModal = () => {
    setSelectedPermission(null);
    setFormError(null);
    setModalVisible(true);
    clearMessages();
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(new Permission(permission));
    setFormError(null);
    setModalVisible(true);
    clearMessages();
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalVisible(false);
    setSelectedPermission(null);
    setFormError(null);
  };

  const handleSubmit = async (permissionToSave: Permission) => {
    setIsSaving(true);
    clearMessages();

    const isEditing = permissionToSave.id > 0;
    const saved = isEditing
      ? await permissionService.update(permissionToSave.id, permissionToSave)
      : await permissionService.create(permissionToSave);

    if (saved === null) {
      setFormError(
        isEditing
          ? "No fue posible actualizar el permiso. Verifique que no exista otro con la misma URL y método."
          : "No fue posible crear el permiso. Verifique que no exista otro con la misma URL y método.",
      );
    } else {
      setSuccess(
        isEditing ? "Permiso actualizado correctamente." : "Permiso creado correctamente.",
      );
      setModalVisible(false);
      setSelectedPermission(null);
      await fetchPermissions();
    }

    setIsSaving(false);
  };

  const openDetailModal = async (permission: Permission) => {
    clearMessages();
    setDetailPermission(permission);
    setDetailRoles(null);
    setDetailError(null);
    setDetailVisible(true);
    setIsLoadingDetail(true);

    const [freshPermission, roles] = await Promise.all([
      permissionService.getById(permission.id),
      permissionService.getRolesByPermission(permission.id),
    ]);

    const detailMessages: string[] = [];
    if (freshPermission === null) {
      detailMessages.push("No fue posible obtener el detalle actualizado del permiso.");
    } else {
      setDetailPermission(freshPermission);
    }
    if (roles === null) {
      detailMessages.push("No fue posible obtener los roles asociados.");
    }
    setDetailError(detailMessages.length > 0 ? detailMessages.join(" ") : null);
    setDetailRoles(roles);
    setIsLoadingDetail(false);
  };

  const closeDetailModal = () => {
    setDetailVisible(false);
    setDetailPermission(null);
    setDetailRoles(null);
    setDetailError(null);
  };

  const openDeleteModal = async (permission: Permission) => {
    clearMessages();
    setDeleteTarget(permission);
    setDeleteRoles(null);
    setDeleteError(null);
    setIsLoadingDeleteRoles(true);

    const roles = await permissionService.getRolesByPermission(permission.id);
    if (roles === null) {
      setDeleteError("No fue posible verificar los roles asociados. Intente nuevamente.");
    }
    setDeleteRoles(roles);
    setIsLoadingDeleteRoles(false);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteRoles(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteRoles || deleteRoles.length > 0) return;

    setIsDeleting(true);
    setDeleteError(null);
    const deleted = await permissionService.remove(deleteTarget.id);

    if (deleted === true) {
      setSuccess("Permiso eliminado correctamente. Los roles asociados no fueron eliminados.");
      setDeleteTarget(null);
      setDeleteRoles(null);
      await fetchPermissions();
    } else {
      setDeleteError(
        "No fue posible eliminar el permiso. Verifique que no esté asignado a un rol e intente nuevamente.",
      );
    }

    setIsDeleting(false);
  };

  const columns: TableColumn<Permission>[] = [
    { header: "ID", accessor: "id" },
    { header: "Módulo", render: (permission) => getPermissionResourceLabel(permission) },
    {
      header: "Método",
      render: (permission) => <span translate="no">{permission.method}</span>,
    },
    { header: "URL", accessor: "url" },
  ];

  const actions: TableAction<Permission>[] = [
    {
      label: "Detalle",
      variant: "outline-info",
      onClick: (permission: Permission) => openDetailModal(permission),
    },
    {
      label: "Editar",
      variant: "outline-secondary",
      onClick: (permission: Permission) => openEditModal(permission),
    },
    {
      label: "Eliminar",
      variant: "outline-danger",
      onClick: (permission: Permission) => openDeleteModal(permission),
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
          existingPermissions={permissions ?? []}
          serverError={formError}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSaving={isSaving}
        />
      </GenericModal>

      <GenericModal
        visible={detailVisible}
        title="Detalle del Permiso"
        onClose={closeDetailModal}
        size="lg"
      >
        {isLoadingDetail ? (
          <Loader text="Cargando detalle del permiso..." />
        ) : (
          <>
            {detailError ? <Alert type="danger" message={detailError} /> : null}

            {detailPermission ? (
              <>
                <dl className="row mb-3">
                  <dt className="col-sm-4">ID</dt>
                  <dd className="col-sm-8">{detailPermission.id}</dd>

                  <dt className="col-sm-4">Módulo</dt>
                  <dd className="col-sm-8">{getPermissionResourceLabel(detailPermission)}</dd>

                  <dt className="col-sm-4">Método</dt>
                  <dd className="col-sm-8" translate="no">
                    {detailPermission.method}
                  </dd>

                  <dt className="col-sm-4">URL</dt>
                  <dd className="col-sm-8">{detailPermission.url}</dd>
                </dl>

                <h6>Roles asociados</h6>
                {detailRoles && detailRoles.length > 0 ? (
                  <ul className="list-group mb-3">
                    {detailRoles.map((role) => (
                      <li key={role.id} className="list-group-item">
                        <strong>{role.name}</strong>
                        <div className="text-body-secondary small">{role.description}</div>
                      </li>
                    ))}
                  </ul>
                ) : detailRoles && detailRoles.length === 0 ? (
                  <Alert type="info" message="Este permiso no está asignado a ningún rol." />
                ) : null}
              </>
            ) : null}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <GenericButton label="Cerrar" variant="secondary" onClick={closeDetailModal} />
              {detailPermission ? (
                <GenericButton
                  label="Editar"
                  variant="warning"
                  onClick={() => {
                    closeDetailModal();
                    openEditModal(detailPermission);
                  }}
                />
              ) : null}
            </div>
          </>
        )}
      </GenericModal>

      <GenericModal
        visible={deleteTarget !== null}
        title="Eliminar Permiso"
        onClose={closeDeleteModal}
        size="lg"
        backdrop={isDeleting ? "static" : true}
      >
        {deleteTarget ? (
          <>
            {deleteError ? <Alert type="danger" message={deleteError} /> : null}

            <p>
              ¿Eliminar el permiso{" "}
              <strong translate="no">
                {deleteTarget.method} {deleteTarget.url}
              </strong>
              ?
            </p>
            <p className="text-body-secondary">
              Módulo: {getPermissionResourceLabel(deleteTarget)}. Esta acción no se puede deshacer.
              Solo se pueden eliminar permisos que no estén asignados a ningún rol.
            </p>

            {isLoadingDeleteRoles ? <Loader text="Verificando roles asociados..." /> : null}

            {deleteRoles && deleteRoles.length > 0 ? (
              <Alert
                type="warning"
                message={`Este permiso está asignado a ${deleteRoles.length} rol(es): ${deleteRoles
                  .map((role) => role.name)
                  .join(", ")}. Retírelo primero desde "Asignar Permisos".`}
              />
            ) : null}

            {deleteRoles && deleteRoles.length === 0 ? (
              <Alert
                type="success"
                message="El permiso no está asignado a ningún rol y puede eliminarse."
              />
            ) : null}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <GenericButton
                label="Cancelar"
                variant="secondary"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              />
              <GenericButton
                label={isDeleting ? "Eliminando..." : "Eliminar"}
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={
                  isDeleting || isLoadingDeleteRoles || !deleteRoles || deleteRoles.length > 0
                }
              />
            </div>
          </>
        ) : null}
      </GenericModal>
    </div>
  );
}