import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilBan,
  cilCheckCircle,
  cilPencil,
  cilSitemap,
  cilTrash,
} from "@coreui/icons";
import { Tournament } from "../../models/Tournament";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import { formatDate, isEnrollmentOpen } from "../../utils/tournamentDates";

export interface TournamentDetailCardProps {
  tournamentDetail: Tournament | null;
  loadingDetail: boolean;
  onEditTournament: (tournament: Tournament) => void;
  onToggleStatus: (tournament: Tournament) => void;
  onDeleteTournament: (tournament: Tournament) => void;
  onViewOverview: (tournament: Tournament) => void;
}

export default function TournamentDetailCard({
  tournamentDetail,
  loadingDetail,
  onEditTournament,
  onToggleStatus,
  onDeleteTournament,
  onViewOverview,
}: TournamentDetailCardProps) {
  if (!tournamentDetail && loadingDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del torneo</div>
        <div className="card-body py-5">
          <Loader text="Cargando detalle del torneo..." />
        </div>
      </div>
    );
  }

  if (!tournamentDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del torneo</div>
        <div className="card-body text-center py-5 text-body-secondary">
          <p className="mb-0">
            Selecciona un torneo de la tabla para consultar su información y
            gestionar sus datos o su estado.
          </p>
        </div>
      </div>
    );
  }

  const enrollmentOpen = isEnrollmentOpen(
    tournamentDetail.enrollmentDeadline,
    tournamentDetail.active,
  );

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Detalle del torneo</span>
        <div className="d-flex align-items-center gap-2">
          {loadingDetail ? (
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            />
          ) : null}
          <span className="badge rounded-pill badge-sports">
            Torneo #{tournamentDetail.id}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
          <div>
            <h5 className="mb-1 fw-bold">{tournamentDetail.name}</h5>
            <div className="text-body-secondary small">
              {tournamentDetail.sportName || "Sin deporte"}
            </div>
          </div>
          <span
            className={`badge rounded-pill ${
              tournamentDetail.active ? "badge-sports" : "bg-secondary"
            }`}
          >
            {tournamentDetail.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <ul className="list-group list-group-flush border-top border-bottom mb-3">
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Deporte</span>
            <span className="fw-semibold small">
              {tournamentDetail.sportName || (
                <span className="text-body-secondary fst-italic">Sin registrar</span>
              )}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Fecha de inicio</span>
            <span className="fw-semibold small">
              {formatDate(tournamentDetail.startDate)}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Cierre de inscripciones</span>
            <span className="fw-semibold small">
              {formatDate(tournamentDetail.enrollmentDeadline)}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Inscripciones</span>
            <span
              className={`badge rounded-pill ${
                enrollmentOpen ? "bg-info text-dark" : "bg-secondary"
              }`}
            >
              {enrollmentOpen ? "Abiertas" : "Cerradas"}
            </span>
          </li>
        </ul>

        <div className="row g-2 mb-3">
          <div className="col-12">
            <button
              type="button"
              className="btn btn-sm btn-sports-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => onViewOverview(tournamentDetail)}
            >
              <CIcon icon={cilSitemap} size="sm" />
              <span>Ver desarrollo del torneo</span>
            </button>
          </div>
          <div className="col-12">
            <button
              type="button"
              className="btn btn-sm btn-sports-edit w-100 d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => onEditTournament(tournamentDetail)}
            >
              <CIcon icon={cilPencil} size="sm" />
              <span>Editar torneo</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className={`btn btn-sm w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 ${
                tournamentDetail.active ? "btn-sports-deactivate" : "btn-sports-primary"
              }`}
              onClick={() => onToggleStatus(tournamentDetail)}
            >
              <CIcon
                icon={tournamentDetail.active ? cilBan : cilCheckCircle}
                size="sm"
              />
              <span>{tournamentDetail.active ? "Desactivar" : "Activar"}</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn btn-sm btn-danger text-white w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => onDeleteTournament(tournamentDetail)}
            >
              <CIcon icon={cilTrash} size="sm" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        <Alert
          type="info"
          message="Si el torneo tiene fases, partidos, equipos inscritos u otra información asociada, no podrá eliminarse; en ese caso puedes desactivarlo."
        />
      </div>
    </div>
  );
}
