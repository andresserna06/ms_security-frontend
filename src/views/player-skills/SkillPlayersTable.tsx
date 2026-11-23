import React from "react";
import { SkillAssignedPlayer } from "../../models/PlayerSkill";
import { User } from "../../models/User";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface SkillPlayersTableProps {
  items: SkillAssignedPlayer[] | null;
  usersById: Map<number, User>;
  isLoading: boolean;
  errorMessage?: string;
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

export default function SkillPlayersTable({
  items,
  usersById,
  isLoading,
  errorMessage = "No fue posible obtener los jugadores con esta habilidad.",
}: SkillPlayersTableProps) {
  const columns: TableColumn<SkillAssignedPlayer>[] = [
    {
      header: "Jugador",
      render: (item) => {
        const user = item.player ? usersById.get(Number(item.player.userId)) : undefined;
        return (
          <div>
            <div className="fw-semibold">
              {user?.name || `Usuario #${item.player?.userId ?? item.playerId}`}
            </div>
            <div className="text-body-secondary small">
              {user?.email || `Jugador #${item.playerId}`}
            </div>
          </div>
        );
      },
    },
    {
      header: "Documento",
      render: (item) => (
        <span className="fw-semibold">{item.player?.document || "—"}</span>
      ),
    },
    {
      header: "Posición",
      render: (item) =>
        item.player?.position ? (
          <span>{item.player.position}</span>
        ) : (
          <span className="text-body-secondary fst-italic">Sin definir</span>
        ),
    },
    {
      header: "Estado jugador",
      render: (item) => (
        <span
          className={`badge rounded-pill ${
            item.player?.active ? "badge-sports" : "bg-secondary"
          }`}
        >
          {item.player?.active ? "Activo" : "Inactivo"}
        </span>
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
      header: "Asignada",
      render: (item) => (
        <span className="small text-body-secondary">
          {formatAssignedDate(item.assignedAt)}
        </span>
      ),
    },
  ];

  return (
    <GenericTable<SkillAssignedPlayer>
      data={items}
      columns={columns}
      getKey={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="Ningún jugador tiene asignada esta habilidad todavía."
      errorMessage={errorMessage}
    />
  );
}
