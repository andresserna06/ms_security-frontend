import React from "react";
import { CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilTrash } from "@coreui/icons";
import { PlayerAssignedSkill } from "../../models/PlayerSkill";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface PlayerSkillsTableProps {
  items: PlayerAssignedSkill[] | null;
  isLoading: boolean;
  errorMessage?: string;
  onRemove: (item: PlayerAssignedSkill) => void;
}

function formatAssignedDate(iso: string): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function PlayerSkillsTable({
  items,
  isLoading,
  errorMessage = "No fue posible obtener las habilidades del jugador.",
  onRemove,
}: PlayerSkillsTableProps) {
  const columns: TableColumn<PlayerAssignedSkill>[] = [
    {
      header: "Habilidad",
      render: (item) => (
        <div>
          <div className="fw-semibold">{item.skill?.name || `Habilidad #${item.skillId}`}</div>
          <div className="text-body-secondary small">
            {item.skill?.description || "Sin descripción"}
          </div>
        </div>
      ),
    },
    {
      header: "Nivel",
      render: (item) =>
        item.level !== null && item.level !== undefined ? (
          <span className="badge rounded-pill badge-sports">
            Nivel {item.level} / 5
          </span>
        ) : (
          <span className="text-body-secondary fst-italic">Sin especificar</span>
        ),
    },
    {
      header: "Fecha de asignación",
      render: (item) => (
        <span className="small text-body-secondary">
          {formatAssignedDate(item.assignedAt)}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (item) => (
        <CTooltip content="Retirar habilidad del jugador">
          <button
            type="button"
            className="btn btn-sm btn-danger text-white btn-icon-action shadow-sm"
            aria-label="Retirar habilidad"
            onClick={() => onRemove(item)}
          >
            <CIcon icon={cilTrash} size="sm" />
          </button>
        </CTooltip>
      ),
    },
  ];

  return (
    <GenericTable<PlayerAssignedSkill>
      data={items}
      columns={columns}
      getKey={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="Este jugador aún no tiene habilidades asignadas."
      errorMessage={errorMessage}
    />
  );
}
