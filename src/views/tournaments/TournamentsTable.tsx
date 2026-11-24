import React from "react";
import { CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBan, cilCheckCircle, cilPencil, cilTrash } from "@coreui/icons";
import { Tournament } from "../../models/Tournament";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";
import { formatDate, isEnrollmentOpen } from "../../utils/tournamentDates";

export interface TournamentsTableProps {
  tournaments: Tournament[] | null;
  isLoading: boolean;
  errorMessage?: string;
  selectedTournamentId: number | null;
  onSelect: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onToggleStatus: (tournament: Tournament) => void;
  onDelete: (tournament: Tournament) => void;
}

export default function TournamentsTable({
  tournaments,
  isLoading,
  errorMessage = "No fue posible obtener la lista de torneos.",
  selectedTournamentId,
  onSelect,
  onEdit,
  onToggleStatus,
  onDelete,
}: TournamentsTableProps) {
  const columns: TableColumn<Tournament>[] = [
    {
      header: "ID",
      render: (tournament) => (
        <span className="text-body-secondary">#{tournament.id}</span>
      ),
    },
    {
      header: "Torneo",
      render: (tournament) => (
        <div>
          <div className="fw-semibold">{tournament.name}</div>
          <div className="text-body-secondary small">
            {tournament.sportName || "Sin deporte"}
          </div>
        </div>
      ),
    },
    {
      header: "Inicio",
      render: (tournament) => (
        <span className="small">{formatDate(tournament.startDate)}</span>
      ),
    },
    {
      header: "Cierre inscripciones",
      render: (tournament) => (
        <div className="d-flex flex-column align-items-start gap-1">
          <span className="small">{formatDate(tournament.enrollmentDeadline)}</span>
          {isEnrollmentOpen(tournament.enrollmentDeadline, tournament.active) ? (
            <span className="badge rounded-pill bg-info text-dark">Abiertas</span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Estado",
      render: (tournament) => (
        <span
          className={`badge rounded-pill ${
            tournament.active ? "badge-sports" : "bg-secondary"
          }`}
        >
          {tournament.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (tournament) => (
        <div
          className="d-flex align-items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <CTooltip content="Editar torneo">
            <button
              type="button"
              className="btn btn-sm btn-sports-edit btn-icon-action shadow-sm"
              aria-label="Editar torneo"
              onClick={() => onEdit(tournament)}
            >
              <CIcon icon={cilPencil} size="sm" />
            </button>
          </CTooltip>

          <CTooltip
            content={tournament.active ? "Desactivar torneo" : "Activar torneo"}
          >
            <button
              type="button"
              className={`btn btn-sm btn-icon-action shadow-sm ${
                tournament.active ? "btn-sports-deactivate" : "btn-sports-primary"
              }`}
              aria-label={tournament.active ? "Desactivar torneo" : "Activar torneo"}
              onClick={() => onToggleStatus(tournament)}
            >
              <CIcon icon={tournament.active ? cilBan : cilCheckCircle} size="sm" />
            </button>
          </CTooltip>

          <CTooltip content="Eliminar torneo">
            <button
              type="button"
              className="btn btn-sm btn-danger text-white btn-icon-action shadow-sm"
              aria-label="Eliminar torneo"
              onClick={() => onDelete(tournament)}
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          </CTooltip>
        </div>
      ),
    },
  ];

  return (
    <GenericTable<Tournament>
      data={tournaments}
      columns={columns}
      getKey={(tournament) => tournament.id}
      isLoading={isLoading}
      emptyMessage="No hay torneos que coincidan con los filtros seleccionados."
      errorMessage={errorMessage}
      onRowClick={onSelect}
      selectedKey={selectedTournamentId}
    />
  );
}
