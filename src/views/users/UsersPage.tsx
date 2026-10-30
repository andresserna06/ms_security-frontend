import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User } from "../../models/User";
import { UserRole } from "../../models/UserRole";
import { IUserService } from "../../services/interfaces/IUserService";
import { IProfileService } from "../../services/interfaces/IProfileService";
import { serviceContainer } from "../../services/serviceContainer";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";
import GenericButton from "../../components/common/GenericButton";
import GenericModal from "../../components/common/GenericModal";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import UserDetailCard from "./UserDetailCard";
import UserFormModal from "./UserFormModal";
import UserProfileModal from "./UserProfileModal";
import UserRolesModal from "./UserRolesModal";

export interface UsersPageProps {
  userService?: IUserService;
  profileService?: IProfileService;
}

export default function UsersPage({
  userService = serviceContainer.userService,
  profileService = serviceContainer.profileService,
}: UsersPageProps) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<UserRole[]>([]);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  const [profileModalUser, setProfileModalUser] = useState<User | null>(null);
  const [rolesModalUser, setRolesModalUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchUsers = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) {
        setIsLoading(true);
      }
      setError(null);
      const result = await userService.getAll();
      if (result === null) {
        setError("No fue posible obtener la lista de usuarios.");
        setUsers(null);
      } else {
        setUsers(result);
        setSelectedUserId((currentId) => {
          if (currentId && result.some((u) => u.id === currentId)) {
            return currentId;
          }
          return result.length > 0 ? result[0].id : null;
        });
      }
      if (showSpinner) {
        setIsLoading(false);
      }
    },
    [userService]
  );

  const fetchUserDetail = useCallback(
    async (userId: number | null) => {
      if (!userId) {
        setSelectedUserDetail(null);
        setSelectedUserRoles([]);
        return;
      }

      setLoadingDetail(true);
      const [detailWithProfile, detailWithRoles] = await Promise.all([
        userService.getDetailWithProfile(userId),
        userService.getDetailWithRoles(userId),
      ]);

      if (detailWithProfile) {
        setSelectedUserDetail(detailWithProfile);
      }
      setSelectedUserRoles(detailWithRoles?.roles || []);
      setLoadingDetail(false);
    },
    [userService]
  );

  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetail(selectedUserId);
    }
  }, [selectedUserId, fetchUserDetail]);

  const filteredUsers = useMemo<User[] | null>(() => {
    if (!users) return null;
    return users.filter((user) => {
      const matchesSearch =
        (user.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const isActive = user.active !== false;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INACTIVE" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setFormModalVisible(true);
    setError(null);
    setSuccess(null);
  };

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(new User(user));
    setFormModalVisible(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmitUserForm = async (userPayload: User) => {
    setSubmittingForm(true);
    setError(null);
    setSuccess(null);

    if (userToEdit && userToEdit.id > 0) {
      const updated = await userService.update(userToEdit.id, userPayload);
      if (updated === null) {
        setSubmittingForm(false);
        throw new Error("No fue posible actualizar el usuario. Verifica que el correo sea único.");
      }
      setUsers((prev) =>
        prev ? prev.map((item) => (item.id === updated.id ? updated : item)) : [updated]
      );
      setSuccess(`Usuario "${updated.name}" actualizado correctamente.`);
      setFormModalVisible(false);
      await fetchUserDetail(updated.id);
    } else {
      const created = await userService.create(userPayload);
      if (created === null) {
        setSubmittingForm(false);
        throw new Error("No fue posible crear el usuario. Verifica que el correo no esté repetido.");
      }
      setUsers((prev) => (prev ? [...prev, created] : [created]));
      setSelectedUserId(created.id);
      setSuccess(`Usuario "${created.name}" registrado correctamente.`);
      setFormModalVisible(false);
    }

    setSubmittingForm(false);
  };

  const handleToggleStatus = async (user: User) => {
    setError(null);
    setSuccess(null);
    const isActive = user.active !== false;

    const updatedUser = isActive
      ? await userService.deactivate(user.id)
      : await userService.activate(user.id);

    if (updatedUser === null) {
      setError("No se pudo cambiar el estado del usuario.");
      return;
    }

    setUsers((prev) =>
      prev ? prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)) : [updatedUser]
    );
    setSelectedUserDetail((prev) =>
      prev && prev.id === updatedUser.id
        ? new User({ ...prev, active: updatedUser.active })
        : prev
    );

    if (isActive) {
      setSuccess(
        `El usuario "${user.name}" ha sido desactivado. Sus roles y permisos del sistema se mantienen intactos.`
      );
    } else {
      setSuccess(`El usuario "${user.name}" ha sido activado nuevamente.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);

    const deleted = await userService.remove(userToDelete.id);
    if (deleted === true) {
      const deletedId = userToDelete.id;
      const deletedName = userToDelete.name;
      setUserToDelete(null);

      const remainingUsers = (users || []).filter((item) => item.id !== deletedId);
      setUsers(remainingUsers);
      setSuccess(
        `Usuario "${deletedName}" eliminado correctamente. Los roles y permisos del sistema permanecen intactos.`
      );

      if (selectedUserId === deletedId) {
        const nextId = remainingUsers.length > 0 ? remainingUsers[0].id : null;
        setSelectedUserId(nextId);
        if (!nextId) {
          setSelectedUserDetail(null);
          setSelectedUserRoles([]);
        }
      }
    } else {
      setError("No fue posible eliminar el usuario.");
    }

    setDeleting(false);
  };

  const columns: TableColumn<User>[] = [
    {
      header: "ID",
      render: (user) => <span className="fw-semibold text-body-secondary">#{user.id}</span>,
    },
    {
      header: "Usuario",
      render: (user) => (
        <span className={selectedUserId === user.id ? "fw-bold text-primary" : "fw-semibold"}>
          {user.name}
        </span>
      ),
    },
    {
      header: "Correo electrónico",
      accessor: "email",
    },
    {
      header: "Estado",
      render: (user) => {
        const isActive = user.active !== false;
        return (
          <span className={`badge rounded-pill ${isActive ? "bg-success" : "bg-secondary"}`}>
            {isActive ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="pb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="mb-1 fw-bold">Gestión de Usuarios</h3>
          <div className="text-body-secondary small">
            Administra los usuarios registrados en la plataforma, su estado, perfil y roles de
            acceso.
          </div>
        </div>
        <div className="d-flex gap-2">
          <GenericButton
            label="Actualizar"
            variant="secondary"
            disabled={isLoading}
            onClick={() => fetchUsers(true)}
          />
          <GenericButton
            label="Nuevo usuario"
            variant="primary"
            onClick={() => handleOpenCreateModal()}
          />
        </div>
      </div>

      {error ? <Alert type="danger" message={error} onClose={() => setError(null)} /> : null}
      {success ? <Alert type="success" message={success} onClose={() => setSuccess(null)} /> : null}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar usuario por nombre o correo electrónico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACTIVE">Solo activos</option>
                <option value="INACTIVE">Solo inactivos</option>
              </select>
            </div>
            <div className="col-md-2 text-md-end text-body-secondary small">
              Total: <strong>{filteredUsers ? filteredUsers.length : 0}</strong> usuario(s)
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-semibold">Listado de usuarios registrados</div>
            <div className="card-body">
              {isLoading ? (
                <Loader text="Cargando listado de usuarios..." />
              ) : (
                <GenericTable<User>
                  data={filteredUsers}
                  columns={columns}
                  getKey={(user) => user.id}
                  onRowClick={(user) => setSelectedUserId(user.id)}
                  selectedKey={selectedUserId}
                  isLoading={false}
                  emptyMessage="No se encontraron usuarios registrados con los filtros seleccionados."
                  errorMessage="No fue posible obtener la lista de usuarios."
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <UserDetailCard
            userDetail={selectedUserDetail}
            userRoles={selectedUserRoles}
            loadingDetail={loadingDetail}
            onEditUser={handleOpenEditModal}
            onManageProfile={(user) => setProfileModalUser(user)}
            onManageRoles={(user) => setRolesModalUser(user)}
            onToggleStatus={handleToggleStatus}
            onDeleteUser={(user) => setUserToDelete(user)}
          />
        </div>
      </div>

      <UserFormModal
        visible={formModalVisible}
        userToEdit={userToEdit}
        submitting={submittingForm}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleSubmitUserForm}
      />

      <UserProfileModal
        visible={Boolean(profileModalUser)}
        user={profileModalUser}
        profileService={profileService}
        onClose={() => setProfileModalUser(null)}
        onSaved={(message) => {
          setSuccess(message);
          if (selectedUserId) {
            fetchUserDetail(selectedUserId);
          }
        }}
      />

      <UserRolesModal
        visible={Boolean(rolesModalUser)}
        user={rolesModalUser}
        onClose={() => setRolesModalUser(null)}
        onRolesUpdated={() => {
          if (selectedUserId) {
            fetchUserDetail(selectedUserId);
          }
        }}
      />

      <GenericModal
        visible={Boolean(userToDelete)}
        title="Confirmar eliminación de usuario"
        onClose={() => setUserToDelete(null)}
        size="sm"
        footer={
          <div className="d-flex gap-2">
            <GenericButton
              label="Cancelar"
              variant="outline-secondary"
              disabled={deleting}
              onClick={() => setUserToDelete(null)}
            />
            <GenericButton
              label={deleting ? "Eliminando..." : "Sí, eliminar usuario"}
              variant="danger"
              disabled={deleting}
              onClick={() => handleConfirmDelete()}
            />
          </div>
        }
      >
        <p className="mb-2">
          ¿Estás seguro de que deseas eliminar permanentemente al usuario{" "}
          <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
        </p>
        <div className="small text-body-secondary">
          Nota: Si solo deseas impedir su acceso temporalmente, puedes usar la opción de{" "}
          <strong>Desactivar</strong>. La eliminación no borrará los roles ni permisos existentes
          en el sistema.
        </div>
      </GenericModal>
    </div>
  );
}
