import React, { useEffect, useState } from "react";
import { Role } from "../../models/Role";
import { IRoleService } from "../../services/interfaces/IRoleService";
import { IPermissionService } from "../../services/interfaces/IPermissionService";
import GenericTable, { TableColumn, TableAction } from "../../components/common/GenericTable";
import GenericButton from "../../components/common/GenericButton";
import GenericModal from "../../components/common/GenericModal";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import RoleForm from "./RoleForm";

interface RolesProps {
  roleService: IRoleService;
  permissionService: IPermissionService;
}

export default function Roles({ roleService }: RolesProps) {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    const result = await roleService.getAll();
    if (result === null) {
      setError("No fue posible obtener la lista de roles.");
      setRoles(null);
    } else {
      setRoles(result);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setSelectedRole(null);
    setModalVisible(true);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(new Role(role));
    setModalVisible(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalVisible(false);
    setSelectedRole(null);
  };

  const handleSubmit = async (roleToSave: Role) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    if (roleToSave.id && roleToSave.id > 0) {
      const updated = await roleService.update(roleToSave.id, roleToSave);
      if (updated === null) {
        setError("No fue posible actualizar el rol.");
      } else {
        setSuccess("Rol actualizado correctamente.");
        setModalVisible(false);
        setSelectedRole(null);
        await fetchRoles();
      }
    } else {
      const created = await roleService.create(roleToSave);
      if (created === null) {
        setError("No fue posible crear el rol.");
      } else {
        setSuccess("Rol creado correctamente.");
        setModalVisible(false);
        setSelectedRole(null);
        await fetchRoles();
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async (role: Role) => {
    const confirmed = window.confirm(`¿Eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setError(null);
    setSuccess(null);
    const deleted = await roleService.remove(role.id);
    if (deleted === true) {
      setSuccess("Rol eliminado correctamente.");
      await fetchRoles();
    } else {
      setError("No fue posible eliminar el rol.");
    }
  };

  const columns: TableColumn<Role>[] = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Descripción", accessor: "description" },
  ];

  const actions: TableAction<Role>[] = [
    {
      label: "Editar",
      variant: "outline-secondary",
      onClick: (role: Role) => openEditModal(role),
    },
    {
      label: "Permisos",
      variant: "outline-info",
      onClick: (role: Role) => {
        console.log("Gestionar permisos del rol", role.id);
        setSuccess(`Pendiente: asignación de permisos para rol #${role.id}`);
      },
    },
    {
      label: "Eliminar",
      variant: "outline-danger",
      onClick: (role: Role) => handleDelete(role),
    },
  ];

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">Gestión de Roles</h2>
        <GenericButton label="Nuevo Rol" variant="primary" onClick={openCreateModal} />
      </div>

      {error ? <Alert type="danger" message={error} onClose={() => setError(null)} /> : null}
      {success ? <Alert type="success" message={success} onClose={() => setSuccess(null)} /> : null}

      {isLoading ? (
        <Loader text="Cargando roles..." />
      ) : (
        <GenericTable<Role>
          data={roles}
          columns={columns}
          actions={actions}
          getKey={(role) => role.id}
          isLoading={false}
          emptyMessage="No hay roles registrados"
          errorMessage="No fue posible obtener la lista de roles."
        />
      )}

      <GenericModal
        visible={modalVisible}
        title={selectedRole ? "Editar Rol" : "Crear Rol"}
        onClose={closeModal}
        size="lg"
      >
        <RoleForm initialRole={selectedRole} onSubmit={handleSubmit} onCancel={closeModal} isSaving={isSaving} />
      </GenericModal>
    </div>
  );
}
