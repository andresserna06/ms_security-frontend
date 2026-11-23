import React from "react";
import { CBadge } from "@coreui/react";
import { SkillAssignedPlayer } from "../../models/PlayerSkill";
import { User } from "../../models/User";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface SkillPlayersTableProps {
  items: SkillAssignedPlayer[] | null;
  usersById: Map<number, User>;
  usersLoaded?: boolean;
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
  usersLoaded = false,
  isLoading,
  errorMessage = "No fue posible obtener los jugadores con esta habilidad.",
}: SkillPlayersTableProps) {
  const columns: TableColumn<SkillAssignedPlayer>[] = [
    {
      header: "Jugador",
      render: (item) => {
        const userId = item.player?.userId;
        const user =
          userId !== undefined ? usersById.get(Number(userId)) : undefined;

        if (!user) {
          return usersLoaded && userId !== undefined ? (
            <div>
              <CBadge color="danger" shape="rounded-pill">
                Cuenta eliminada (ID #{userId})
              </CBadge>
            </div>
          ) : (
            <div>
              <div className="fw-semibold">
                Usuario #{userId ?? item.playerId}
              </div>
              <div className="text-body-secondary small">
                Jugador #{item.playerId}
              </div>
            </div>
          );
        }

        return (
          <div>
            <div className="d-flex flex-wrap align-items-center gap-1">
              <span className="fw-semibold">
                {user.name || `Usuario #${userId}`}
              </span>
              {user.active === false ? (
                <CBadge color="secondary" shape="rounded-pill">
                  Cuenta inactiva
                </CBadge>
              ) : null}
            </div>
            <div className="text-body-secondary small">
              {user.email || `Jugador #${item.playerId}`}
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
