import React from "react";
import { Phase, getFinalRoundLabel } from "../../models/Phase";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface PhasesTableProps {
  phases: Phase[] | null;
  isLoading: boolean;
  errorMessage?: string;
  onEdit: (phase: Phase) => void;
  onDelete: (phase: Phase) => void;
}

export default function PhasesTable({
  phases,
  isLoading,
  errorMessage = "No fue posible obtener las fases finales.",
  onEdit,
  onDelete,
}: PhasesTableProps) {
  const columns: TableColumn<Phase>[] = [
    {
      header: "Orden",
      render: (phase) => String(phase.order),
    },
    {
      header: "Ronda",
      render: (phase) => getFinalRoundLabel(phase.finalRound) || "-",
    },
    {
      header: "Acciones",
      render: (phase) => (
        <div className="d-flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
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
      getKey={(phase) => phase.id}
      isLoading={isLoading}
      emptyMessage="No hay fases finales para el filtro seleccionado."
      errorMessage={errorMessage}
    />
  );
}
