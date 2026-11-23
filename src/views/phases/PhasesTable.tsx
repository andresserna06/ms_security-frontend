import React from "react";
import { CBadge } from "@coreui/react";
import { Phase, getFinalRoundLabel } from "../../models/Phase";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface PhasesTableProps {
  phases: Phase[] | null;
  isLoading: boolean;
  errorMessage?: string;
  onEdit: (phase: Phase) => void;
  onDelete: (phase: Phase) => void;
  onManageTeams: (phase: Phase) => void;
}

export default function PhasesTable({
  phases,
  isLoading,
  errorMessage = "No fue posible obtener las fases.",
  onEdit,
  onDelete,
  onManageTeams,
}: PhasesTableProps) {
  const columns: TableColumn<Phase>[] = [
    {
      header: "Nombre",
      render: (phase) => phase.name,
    },
    {
      header: "Tipo",
      render: (phase) => (
        <CBadge color={phase.phaseType === "GROUP" ? "info" : "primary"} shape="rounded-pill">
          {phase.phaseType === "GROUP" ? "Grupo" : "Final"}
        </CBadge>
      ),
    },
    {
      header: "Orden",
      render: (phase) => String(phase.order),
    },
    {
      header: "Ronda",
      render: (phase) =>
        phase.phaseType === "FINAL"
          ? getFinalRoundLabel(phase.finalRound) || "-"
          : "-",
    },
    {
      header: "Acciones",
      render: (phase) => (
        <div className="d-flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {phase.phaseType === "GROUP" ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              onClick={() => onManageTeams(phase)}
            >
              Equipos
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => onEdit(phase)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(phase)}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <GenericTable<Phase>
      data={phases}
      columns={columns}
      getKey={(phase) => `${phase.phaseType}-${phase.id}`}
      isLoading={isLoading}
      emptyMessage="No hay fases para el filtro seleccionado."
      errorMessage={errorMessage}
    />
  );
}
