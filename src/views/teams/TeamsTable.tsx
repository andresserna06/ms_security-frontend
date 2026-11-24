import React from "react";
import { CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBan, cilCheckCircle, cilPencil, cilTrash } from "@coreui/icons";
import { Team } from "../../models/Team";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";
import TeamLogo from "../../components/common/TeamLogo";

export interface TeamsTableProps {
  teams: Team[] | null;
  isLoading: boolean;
  errorMessage?: string;
  selectedTeamId: number | null;
  onSelect: (team: Team) => void;
  onEdit: (team: Team) => void;
  onToggleStatus: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export default function TeamsTable({
  teams,
  isLoading,
  errorMessage = "No fue posible obtener la lista de equipos.",
  selectedTeamId,
  onSelect,
  onEdit,
  onToggleStatus,
  onDelete,
}: TeamsTableProps) {
  const columns: TableColumn<Team>[] = [
    {
      header: "ID",
      render: (team) => <span className="text-body-secondary">#{team.id}</span>,
    },
    {
      header: "Equipo",
      render: (team) => (
        <div className="d-flex align-items-center gap-2">
          <TeamLogo name={team.name} logo={team.logo} size={34} />
          <div>
            <div className="fw-semibold">{team.name}</div>
            <div className="text-body-secondary small">
              {team.contactEmail || "Sin correo de contacto"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Ciudad",
      render: (team) => <span>{team.city}</span>,
    },
    {
      header: "Fundación",
      render: (team) =>
        team.foundedYear !== null && team.foundedYear !== undefined ? (
          <span className="badge rounded-pill bg-dark">{team.foundedYear}</span>
        ) : (
          <span className="text-body-secondary fst-italic">—</span>
        ),
    },
    {
      header: "Estado",
      render: (team) => (
        <span
          className={`badge rounded-pill ${
            team.active ? "badge-sports" : "bg-secondary"
          }`}
        >
          {team.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (team) => (
        <div
          className="d-flex align-items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <CTooltip content="Editar equipo">
            <button
              type="button"
              className="btn btn-sm btn-sports-edit btn-icon-action shadow-sm"
              aria-label="Editar equipo"
              onClick={() => onEdit(team)}
            >
              <CIcon icon={cilPencil} size="sm" />
            </button>
          </CTooltip>

          <CTooltip content={team.active ? "Desactivar equipo" : "Activar equipo"}>
            <button
              type="button"
              className={`btn btn-sm btn-icon-action shadow-sm ${
                team.active ? "btn-sports-deactivate" : "btn-sports-primary"
              }`}
              aria-label={team.active ? "Desactivar equipo" : "Activar equipo"}
              onClick={() => onToggleStatus(team)}
            >
              <CIcon icon={team.active ? cilBan : cilCheckCircle} size="sm" />
            </button>
          </CTooltip>

          <CTooltip content="Eliminar equipo">
            <button
              type="button"
              className="btn btn-sm btn-danger text-white btn-icon-action shadow-sm"
              aria-label="Eliminar equipo"
              onClick={() => onDelete(team)}
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          </CTooltip>
        </div>
      ),
    },
  ];

  return (
    <GenericTable<Team>
      data={teams}
      columns={columns}
      getKey={(team) => team.id}
      isLoading={isLoading}
      emptyMessage="No hay equipos que coincidan con los filtros seleccionados."
      errorMessage={errorMessage}
      onRowClick={onSelect}
      selectedKey={selectedTeamId}
    />
  );
}
