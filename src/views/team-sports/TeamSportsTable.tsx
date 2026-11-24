import React from "react";
import { CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLinkBroken } from "@coreui/icons";
import { TeamSportSummary } from "../../models/TeamSport";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface TeamSportsTableProps {
  // What each row is: the sports of a team or the teams of a sport.
  entityLabel: "Deporte" | "Equipo";
  items: TeamSportSummary[] | null;
  isLoading: boolean;
  errorMessage?: string;
  emptyMessage: string;
  onRemove: (item: TeamSportSummary) => void;
}

export default function TeamSportsTable({
  entityLabel,
  items,
  isLoading,
  errorMessage,
  emptyMessage,
  onRemove,
}: TeamSportsTableProps) {
  const lowerLabel = entityLabel.toLowerCase();

  const columns: TableColumn<TeamSportSummary>[] = [
    {
      header: "ID",
      render: (item) => <span className="text-body-secondary">#{item.id}</span>,
    },
    {
      header: entityLabel,
      render: (item) => <span className="fw-semibold">{item.name}</span>,
    },
    {
      header: "Estado",
      render: (item) => (
        <span
          className={`badge rounded-pill ${
            item.active ? "badge-sports" : "bg-secondary"
          }`}
        >
          {item.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (item) => (
        <CTooltip content="Retirar asociación">
          <button
            type="button"
            className="btn btn-sm btn-danger text-white btn-icon-action shadow-sm"
            aria-label={`Retirar ${lowerLabel} ${item.name}`}
            onClick={() => onRemove(item)}
          >
            <CIcon icon={cilLinkBroken} size="sm" />
          </button>
        </CTooltip>
      ),
    },
  ];

  return (
    <GenericTable<TeamSportSummary>
      data={items}
      columns={columns}
      getKey={(item) => item.id}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
    />
  );
}
