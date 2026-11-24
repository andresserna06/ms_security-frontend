import React from "react";
import CIcon from "@coreui/icons-react";
import { cilBan, cilCheckCircle, cilPencil, cilTrash } from "@coreui/icons";
import { Team } from "../../models/Team";
import { TeamSportSummary } from "../../models/TeamSport";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import TeamLogo from "../../components/common/TeamLogo";

export interface TeamDetailCardProps {
  teamDetail: Team | null;
  teamSports: TeamSportSummary[];
  loadingDetail: boolean;
  onEditTeam: (team: Team) => void;
  onToggleStatus: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
}

export default function TeamDetailCard({
  teamDetail,
  teamSports,
  loadingDetail,
  onEditTeam,
  onToggleStatus,
  onDeleteTeam,
}: TeamDetailCardProps) {
  if (!teamDetail && loadingDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del equipo</div>
        <div className="card-body py-5">
          <Loader text="Cargando detalle del equipo..." />
        </div>
      </div>
    );
  }

  if (!teamDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del equipo</div>
        <div className="card-body text-center py-5 text-body-secondary">
          <p className="mb-0">
            Selecciona un equipo de la tabla para consultar su información y
            gestionar sus datos o su estado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Detalle del equipo</span>
        <div className="d-flex align-items-center gap-2">
          {loadingDetail ? (
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            />
          ) : null}
          <span className="badge rounded-pill badge-sports">
            Equipo #{teamDetail.id}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
          <div className="d-flex align-items-center gap-3">
            <TeamLogo name={teamDetail.name} logo={teamDetail.logo} size={52} />
            <div>
              <h5 className="mb-1 fw-bold">{teamDetail.name}</h5>
              <div className="text-body-secondary small">{teamDetail.city}</div>
            </div>
          </div>

          <span
            className={`badge rounded-pill ${
              teamDetail.active ? "badge-sports" : "bg-secondary"
            }`}
          >
            {teamDetail.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <ul className="list-group list-group-flush border-top border-bottom mb-3">
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Ciudad</span>
            <span className="fw-semibold small">{teamDetail.city}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Correo de contacto</span>
            <span className="fw-semibold small text-break text-end">
              {teamDetail.contactEmail || (
                <span className="text-body-secondary fst-italic">Sin registrar</span>
              )}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Año de fundación</span>
            <span className="fw-semibold small">
              {teamDetail.foundedYear ?? (
                <span className="text-body-secondary fst-italic">Sin registrar</span>
              )}
            </span>
          </li>
          <li className="list-group-item px-0 py-2">
            <div className="text-body-secondary small mb-1">Deportes asociados</div>
            {teamSports.length === 0 ? (
              <span className="text-body-secondary fst-italic small">
                El equipo no tiene deportes asociados
              </span>
            ) : (
              <div className="d-flex flex-wrap gap-1">
                {teamSports.map((sport) => (
                  <span
                    key={sport.id}
                    className={`badge rounded-pill ${
                      sport.active ? "badge-sports" : "bg-secondary"
                    }`}
                  >
                    {sport.name}
                  </span>
                ))}
              </div>
            )}
          </li>
        </ul>

        <div className="row g-2 mb-3">
          <div className="col-12">
            <button
              type="button"
              className="btn btn-sm btn-sports-edit w-100 d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => onEditTeam(teamDetail)}
            >
              <CIcon icon={cilPencil} size="sm" />
              <span>Editar equipo</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className={`btn btn-sm w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 ${
                teamDetail.active ? "btn-sports-deactivate" : "btn-sports-primary"
              }`}
              onClick={() => onToggleStatus(teamDetail)}
            >
              <CIcon icon={teamDetail.active ? cilBan : cilCheckCircle} size="sm" />
              <span>{teamDetail.active ? "Desactivar" : "Activar"}</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn btn-sm btn-danger text-white w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => onDeleteTeam(teamDetail)}
            >
              <CIcon icon={cilTrash} size="sm" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        <Alert
          type="info"
          message="Si el equipo tiene deportes, contratos, inscripciones, partidos u otra información asociada, no podrá eliminarse; en ese caso puedes desactivarlo."
        />
      </div>
    </div>
  );
}
