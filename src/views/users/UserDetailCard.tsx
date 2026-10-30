import React from "react";
import { User } from "../../models/User";
import { UserRole } from "../../models/UserRole";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";

export interface UserDetailCardProps {
  userDetail: User | null;
  userRoles: UserRole[];
  loadingDetail: boolean;
  onEditUser: (user: User) => void;
  onManageProfile: (user: User) => void;
  onManageRoles: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export default function UserDetailCard({
  userDetail,
  userRoles,
  loadingDetail,
  onEditUser,
  onManageProfile,
  onManageRoles,
  onToggleStatus,
  onDeleteUser,
}: UserDetailCardProps) {
  if (!userDetail && loadingDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del usuario</div>
        <div className="card-body py-5">
          <Loader text="Cargando detalle del usuario..." />
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del usuario</div>
        <div className="card-body text-center py-5 text-body-secondary">
          <p className="mb-0">
            Selecciona un usuario de la tabla para consultar su información detallada y gestionar
            su perfil, roles y estado.
          </p>
        </div>
      </div>
    );
  }

  const isActive = userDetail.active !== false;
  const profile = userDetail.profile;
  const roles = userRoles || [];

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Detalle del usuario</span>
        <div className="d-flex align-items-center gap-2">
          {loadingDetail ? (
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
          ) : null}
          <span className="badge rounded-pill bg-info">ID: #{userDetail.id}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1 fw-bold">{userDetail.name}</h5>
            <div className="text-body-secondary small">{userDetail.email}</div>
          </div>
          <span className={`badge rounded-pill ${isActive ? "bg-success" : "bg-secondary"}`}>
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>

        <ul className="list-group list-group-flush border-top border-bottom mb-3">
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Nombre completo</span>
            <span className="fw-semibold small">{userDetail.name}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Correo electrónico</span>
            <span className="fw-semibold small">{userDetail.email}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Teléfono (Perfil)</span>
            <span className="fw-semibold small">
              {profile?.phone ? (
                profile.phone
              ) : (
                <span className="text-body-secondary fst-italic">Sin registrar</span>
              )}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Fecha de nacimiento</span>
            <span className="fw-semibold small">
              {profile?.birthDate ? (
                profile.birthDate
              ) : (
                <span className="text-body-secondary fst-italic">Sin registrar</span>
              )}
            </span>
          </li>
        </ul>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small text-uppercase text-body-secondary">
              Roles asociados ({roles.length})
            </span>
          </div>
          {roles.length === 0 ? (
            <div className="text-body-secondary small fst-italic">
              Este usuario aún no tiene roles asignados.
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {roles.map((userRole, idx) => (
                <span
                  key={userRole.id ?? userRole.role?.id ?? idx}
                  className="badge rounded-pill bg-primary px-3 py-2"
                >
                  {userRole.role?.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="row g-2 mb-3">
          <div className="col-12">
            <GenericButton
              label="Editar usuario"
              variant="primary"
              className="btn-sm w-100 fw-semibold"
              onClick={() => onEditUser(userDetail)}
            />
          </div>
          <div className="col-6">
            <GenericButton
              label="Gestionar Perfil"
              variant="info"
              className="btn-sm w-100 text-white fw-semibold"
              onClick={() => onManageProfile(userDetail)}
            />
          </div>
          <div className="col-6">
            <GenericButton
              label="Gestionar Roles"
              variant="secondary"
              className="btn-sm w-100 text-white fw-semibold"
              onClick={() => onManageRoles(userDetail)}
            />
          </div>
          <div className="col-6">
            <GenericButton
              label={isActive ? "Desactivar" : "Activar"}
              variant={isActive ? "warning" : "success"}
              className="btn-sm w-100 text-white fw-semibold"
              onClick={() => onToggleStatus(userDetail)}
            />
          </div>
          <div className="col-6">
            <GenericButton
              label="Eliminar"
              variant="danger"
              className="btn-sm w-100 text-white fw-semibold"
              onClick={() => onDeleteUser(userDetail)}
            />
          </div>
        </div>

        <Alert
          type="info"
          message="La eliminación o desactivación de un usuario no elimina los roles ni permisos existentes en el sistema."
        />
      </div>
    </div>
  );
}
