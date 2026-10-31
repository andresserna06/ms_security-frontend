// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Role } from "../../models/Role";
import { User } from "../../models/User";
import { UserRole } from "../../models/UserRole";
import { Permission } from "../../models/Permission";
import { IRoleService } from "../../services/interfaces/IRoleService";
import { IPermissionService } from "../../services/interfaces/IPermissionService";
import { serviceContainer } from "../../services/serviceContainer";
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

type ManagementMode = "detail" | "users" | "permissions";

export default function Roles({ roleService, permissionService }: RolesProps) {
  const userRoleService = serviceContainer.userRoleService;

  const [roles, setRoles] = useState<Role[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [managementMode, setManagementMode] = useState<ManagementMode | null>(null);
  const [managementRole, setManagementRole] = useState<Role | null>(null);
  const [managementLoading, setManagementLoading] = useState<boolean>(false);
  const [managementSubmitting, setManagementSubmitting] = useState<boolean>(false);
  const [managementError, setManagementError] = useState<string | null>(null);
  const [managementSuccess, setManagementSuccess] = useState<string | null>(null);

  const [detailUsersCount, setDetailUsersCount] = useState<number>(0);
  const [detailPermissionsCount, setDetailPermissionsCount] = useState<number>(0);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<UserRole[]>([]);
  const [selectedUserIdForRole, setSelectedUserIdForRole] = useState<string>("");

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>("");

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

  const loadManagementData = async (
    mode: ManagementMode,
    role: Role,
    isCancelled: () => boolean = () => false,
  ) => {
    setManagementLoading(true);
    setManagementError(null);

    if (mode === "detail") {
      const [assignments, permissions] = await Promise.all([
        userRoleService.getByRole(role.id),
        permissionService.getByRole(role.id),
      ]);

      if (isCancelled()) return;

      if (assignments === null || permissions === null) {
        setDetailUsersCount(0);
        setDetailPermissionsCount(0);
        setManagementError("No fue posible cargar el detalle del rol.");
      } else {
        setDetailUsersCount(assignments.length);
        setDetailPermissionsCount(permissions.length);
      }
    } else if (mode === "users") {
      const [usersCatalog, assignments] = await Promise.all([
        userRoleService.getAllUsers(),
        userRoleService.getByRole(role.id),
      ]);

      if (isCancelled()) return;

      if (usersCatalog === null || assignments === null) {
        setAllUsers([]);
        setRoleAssignments([]);
        setManagementError("No fue posible cargar la información de usuarios del rol.");
      } else {
        setAllUsers(usersCatalog);
        setRoleAssignments(assignments);
        setSelectedUserIdForRole("");
      }
    } else {
      const [permissionsCatalog, permissions] = await Promise.all([
        permissionService.getAll(),
        permissionService.getByRole(role.id),
      ]);

      if (isCancelled()) return;

      if (permissionsCatalog === null || permissions === null) {
        setAllPermissions([]);
        setAssignedPermissions([]);
        setManagementError("No fue posible cargar la información de permisos del rol.");
      } else {
        setAllPermissions(permissionsCatalog);
        setAssignedPermissions(permissions);
        setSelectedPermissionId("");
      }
    }

    setManagementLoading(false);
  };

  useEffect(() => {
    if (!managementMode || !managementRole) {
      return;
    }

    let cancelled = false;
    loadManagementData(managementMode, managementRole, () => cancelled);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementMode, managementRole, userRoleService, permissionService]);

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

  const openManagement = (role: Role, mode: ManagementMode) => {
    setManagementRole(new Role(role));
    setManagementMode(mode);
    setManagementError(null);
    setManagementSuccess(null);
    setSelectedUserIdForRole("");
    setSelectedPermissionId("");
  };

  const closeManagement = () => {
    if (managementSubmitting) return;
    setManagementMode(null);
    setManagementRole(null);
    setManagementError(null);
    setManagementSuccess(null);
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
        setError("No fue posible crear el rol. Verifica que el nombre no esté duplicado.");
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
    setError(null);
    setSuccess(null);

    const assignments = await userRoleService.getByRole(role.id);
    if (assignments === null) {
      setError("No fue posible validar si el rol tiene usuarios asignados. Intenta nuevamente.");
      return;
    }

    if (assignments.length > 0) {
      setError(
        `No se puede eliminar el rol "${role.name}" porque está asignado a ${assignments.length} usuario(s). Retira primero esas asignaciones.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar el rol "${role.name}"? Esta acción no se puede deshacer. Los usuarios y permisos de la plataforma no serán eliminados.`,
    );
    if (!confirmed) return;

    const deleted = await roleService.remove(role.id);
    if (deleted === true) {
      setSuccess("Rol eliminado correctamente.");
      await fetchRoles();
    } else {
      setError("No fue posible eliminar el rol. Verifica que no tenga usuarios asignados.");
    }
  };

  const handleAssignUserToRole = async () => {
    if (!managementRole || !selectedUserIdForRole) return;

    setManagementSubmitting(true);
    setManagementError(null);
    setManagementSuccess(null);

    const assigned = await userRoleService.assignRole(Number(selectedUserIdForRole), managementRole.id);

    if (assigned === null) {
      setManagementError("No fue posible asignar el rol al usuario.");
      setManagementSubmitting(false);
      return;
    }

    await loadManagementData("users", managementRole);
    setManagementSuccess("Usuario asignado al rol correctamente.");
    setManagementSubmitting(false);
  };

  const handleRemoveUserFromRole = async (assignment: UserRole) => {
    if (!managementRole) return;

    const userId = assignment.user?.id ?? assignment.userId;
    if (!userId) return;

    const confirmed = window.confirm(
      `¿Retirar el rol "${managementRole.name}" del usuario "${assignment.user?.name ?? `#${userId}`}"? El usuario y el rol permanecerán en el sistema.`,
    );
    if (!confirmed) return;

    setManagementSubmitting(true);
    setManagementError(null);
    setManagementSuccess(null);

    const removed = await userRoleService.removeRole(userId, managementRole.id);

    if (removed !== true) {
      setManagementError("No fue posible retirar el usuario del rol.");
      setManagementSubmitting(false);
      return;
    }

    await loadManagementData("users", managementRole);
    setManagementSuccess("Usuario retirado del rol (el usuario y el rol permanecen en el sistema).");
    setManagementSubmitting(false);
  };

  const handleAssignPermissionToRole = async () => {
    if (!managementRole || !selectedPermissionId) return;

    setManagementSubmitting(true);
    setManagementError(null);
    setManagementSuccess(null);

    const assigned = await permissionService.assignToRole(managementRole.id, [Number(selectedPermissionId)]);

    if (assigned !== true) {
      setManagementError("No fue posible asignar el permiso al rol.");
      setManagementSubmitting(false);
      return;
    }

    await loadManagementData("permissions", managementRole);
    setManagementSuccess("Permiso asignado al rol correctamente.");
    setManagementSubmitting(false);
  };

  const handleRemovePermissionFromRole = async (permission: Permission) => {
    if (!managementRole) return;

    const confirmed = window.confirm(
      `¿Retirar el permiso "${permission.method} ${permission.url}" del rol "${managementRole.name}"? El permiso permanecerá en la plataforma.`,
    );
    if (!confirmed) return;

    setManagementSubmitting(true);
    setManagementError(null);
    setManagementSuccess(null);

    const removed = await permissionService.removeFromRole(managementRole.id, permission.id);

    if (removed !== true) {
      setManagementError("No fue posible retirar el permiso del rol.");
      setManagementSubmitting(false);
      return;
    }

    await loadManagementData("permissions", managementRole);
    setManagementSuccess("Permiso retirado del rol (el permiso permanece en el sistema).");
    setManagementSubmitting(false);
  };

  const columns: TableColumn<Role>[] = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Descripción", accessor: "description" },
  ];

  const actions: TableAction<Role>[] = [
    {
      label: "Detalle",
      variant: "info",
      onClick: (role: Role) => openManagement(role, "detail"),
    },
    {
      label: "Editar",
      variant: "warning",
      onClick: (role: Role) => openEditModal(role),
    },
    {
      label: "Usuarios",
      variant: "primary",
      onClick: (role: Role) => openManagement(role, "users"),
    },
    {
      label: "Permisos",
      variant: "success",
      onClick: (role: Role) => openManagement(role, "permissions"),
    },
    {
      label: "Eliminar",
      variant: "danger",
      onClick: (role: Role) => handleDelete(role),
    },
  ];

  const assignedUserIds = new Set(
    roleAssignments
      .map((assignment) => assignment.user?.id ?? assignment.userId)
      .filter((userId): userId is number => typeof userId === "number"),
  );
  const availableUsers = allUsers.filter((user) => !assignedUserIds.has(user.id));

  const assignedPermissionIds = new Set(assignedPermissions.map((permission) => permission.id));
  const availablePermissions = allPermissions.filter(
    (permission) => !assignedPermissionIds.has(permission.id),
  );

  const managementTitle =
    managementMode === "detail"
      ? `Detalle del Rol — ${managementRole?.name ?? ""}`
      : managementMode === "users"
        ? `Gestionar Usuarios — ${managementRole?.name ?? ""}`
        : `Gestionar Permisos — ${managementRole?.name ?? ""}`;

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-1 fw-bold text-primary-emphasis">Gestión de Roles</h2>
          <div className="text-body-secondary small">
            Define los niveles de acceso y administra los usuarios y permisos de cada rol.
          </div>
        </div>
        <GenericButton label="Nuevo Rol" variant="success" onClick={openCreateModal} />
      </div>

      {error ? <Alert type="danger" message={error} onClose={() => setError(null)} /> : null}
      {success ? <Alert type="success" message={success} onClose={() => setSuccess(null)} /> : null}

      <div className="card shadow-sm">
        <div className="card-header bg-primary-subtle text-primary-emphasis d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Roles registrados</span>
          <span className="badge text-bg-primary">{roles?.length ?? 0}</span>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-3">
              <Loader text="Cargando roles..." />
            </div>
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
        </div>
      </div>

      <GenericModal
        visible={modalVisible}
        title={selectedRole ? "Editar Rol" : "Crear Rol"}
        onClose={closeModal}
        size="lg"
      >
        <RoleForm
          initialRole={selectedRole}
          existingRoles={roles ?? []}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSaving={isSaving}
        />
      </GenericModal>

      <GenericModal
        visible={Boolean(managementMode && managementRole)}
        title={managementTitle}
        onClose={closeManagement}
        size="lg"
        backdrop={managementMode === "detail" ? undefined : "static"}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            {managementMode !== "detail" && managementRole ? (
              <GenericButton
                label="Volver al detalle"
                variant="secondary"
                onClick={() => openManagement(managementRole, "detail")}
                disabled={managementSubmitting}
              />
            ) : null}
            {managementMode === "detail" && managementRole ? (
              <>
                <GenericButton
                  label="Gestionar usuarios"
                  variant="primary"
                  onClick={() => openManagement(managementRole, "users")}
                />
                <GenericButton
                  label="Gestionar permisos"
                  variant="success"
                  onClick={() => openManagement(managementRole, "permissions")}
                />
              </>
            ) : null}
            <GenericButton
              label="Cerrar"
              variant="secondary"
              onClick={closeManagement}
              disabled={managementSubmitting}
            />
          </div>
        }
      >
        {managementError ? (
          <Alert type="danger" message={managementError} onClose={() => setManagementError(null)} />
        ) : null}
        {managementSuccess ? (
          <Alert type="success" message={managementSuccess} onClose={() => setManagementSuccess(null)} />
        ) : null}

        {managementLoading ? (
          <Loader text="Cargando información del rol..." />
        ) : managementMode === "detail" && managementRole ? (
          <>
            <dl className="row mb-3">
              <dt className="col-sm-4 text-body-secondary small">ID</dt>
              <dd className="col-sm-8 fw-semibold small">#{managementRole.id}</dd>
              <dt className="col-sm-4 text-body-secondary small">Nombre</dt>
              <dd className="col-sm-8 fw-semibold small">{managementRole.name}</dd>
              <dt className="col-sm-4 text-body-secondary small">Descripción</dt>
              <dd className="col-sm-8 fw-semibold small">{managementRole.description}</dd>
              <dt className="col-sm-4 text-body-secondary small">Usuarios asignados</dt>
              <dd className="col-sm-8">
                <span className="badge bg-info">{detailUsersCount}</span>
              </dd>
              <dt className="col-sm-4 text-body-secondary small">Permisos asignados</dt>
              <dd className="col-sm-8">
                <span className="badge bg-primary">{detailPermissionsCount}</span>
              </dd>
            </dl>
            <Alert
              type="info"
              message="Desde este detalle puedes gestionar los usuarios y permisos asociados al rol. Eliminar el rol no elimina los usuarios ni los permisos de la plataforma."
            />
          </>
        ) : managementMode === "users" && managementRole ? (
          <>
            <div className="mb-4">
              <label htmlFor="role-user-select" className="form-label fw-semibold small">
                Asignar nuevo usuario al rol
              </label>
              <div className="row g-2">
                <div className="col-sm-8">
                  <select
                    id="role-user-select"
                    className="form-select"
                    value={selectedUserIdForRole}
                    onChange={(event) => setSelectedUserIdForRole(event.target.value)}
                    disabled={managementSubmitting || availableUsers.length === 0}
                  >
                    <option value="">
                      {availableUsers.length === 0
                        ? "No hay más usuarios disponibles para asignar"
                        : "Selecciona un usuario..."}
                    </option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-4">
                  <GenericButton
                    label="Asignar usuario"
                    variant="primary"
                    className="w-100"
                    onClick={handleAssignUserToRole}
                    disabled={!selectedUserIdForRole || managementSubmitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="fw-semibold small mb-2">
                Usuarios asignados al rol ({roleAssignments.length})
              </div>
              {roleAssignments.length === 0 ? (
                <div className="text-body-secondary small fst-italic py-3 text-center border rounded">
                  Este rol no tiene usuarios asignados actualmente.
                </div>
              ) : (
                <ul className="list-group">
                  {roleAssignments.map((assignment) => {
                    const user = assignment.user;
                    const isActive = user?.active !== false;

                    return (
                      <li
                        key={assignment.id || user?.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-semibold small me-2">{user?.name}</span>
                          <span className="small text-body-secondary me-2">{user?.email}</span>
                          <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
                            {isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <GenericButton
                          label="Retirar"
                          variant="outline-danger"
                          onClick={() => handleRemoveUserFromRole(assignment)}
                          disabled={managementSubmitting}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Alert
              type="info"
              message="Un usuario puede tener uno o varios roles y un rol puede estar asociado a varios usuarios. Retirar la asignación no elimina al usuario ni el rol."
            />
          </>
        ) : managementMode === "permissions" && managementRole ? (
          <>
            <div className="mb-4">
              <label htmlFor="role-permission-select" className="form-label fw-semibold small">
                Asignar nuevo permiso al rol
              </label>
              <div className="row g-2">
                <div className="col-sm-8">
                  <select
                    id="role-permission-select"
                    className="form-select"
                    value={selectedPermissionId}
                    onChange={(event) => setSelectedPermissionId(event.target.value)}
                    disabled={managementSubmitting || availablePermissions.length === 0}
                  >
                    <option value="">
                      {availablePermissions.length === 0
                        ? "No hay más permisos disponibles para asignar"
                        : "Selecciona un permiso..."}
                    </option>
                    {availablePermissions.map((permission) => (
                      <option key={permission.id} value={permission.id}>
                        {permission.method} — {permission.url}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-4">
                  <GenericButton
                    label="Asignar permiso"
                    variant="primary"
                    className="w-100"
                    onClick={handleAssignPermissionToRole}
                    disabled={!selectedPermissionId || managementSubmitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="fw-semibold small mb-2">
                Permisos asignados al rol ({assignedPermissions.length})
              </div>
              {assignedPermissions.length === 0 ? (
                <div className="text-body-secondary small fst-italic py-3 text-center border rounded">
                  Este rol no tiene permisos asignados actualmente.
                </div>
              ) : (
                <ul className="list-group">
                  {assignedPermissions.map((permission) => (
                    <li
                      key={permission.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="badge bg-info me-2">{permission.method}</span>
                        <span className="small">{permission.url}</span>
                      </div>
                      <GenericButton
                        label="Retirar"
                        variant="outline-danger"
                        onClick={() => handleRemovePermissionFromRole(permission)}
                        disabled={managementSubmitting}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Alert
              type="info"
              message="Retirar un permiso del rol no elimina el permiso de la plataforma ni afecta a otros roles."
            />
          </>
        ) : null}
      </GenericModal>
    </div>
  );
}