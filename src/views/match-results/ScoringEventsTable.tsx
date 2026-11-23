import React, { useMemo } from "react";
import { CBadge, CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash } from "@coreui/icons";
import { Player } from "../../models/Player";
import { ScoringEvent } from "../../models/ScoringEvent";
import { Team } from "../../models/Team";
import { User } from "../../models/User";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface ScoringEventsTableProps {
  events: ScoringEvent[] | null;
  playersById: Map<number, Player>;
  teamsById: Map<number, Team>;
  usersById: Map<number, User>;
  usersLoaded: boolean;
  isLoading: boolean;
  isBlocked: boolean;
  errorMessage?: string;
  onEdit: (event: ScoringEvent) => void;
  onDelete: (event: ScoringEvent) => void;
}

export default function ScoringEventsTable({
  events,
  playersById,
  teamsById,
  usersById,
  usersLoaded,
  isLoading,
  isBlocked,
  errorMessage = "No fue posible obtener las anotaciones del partido.",
  onEdit,
  onDelete,
}: ScoringEventsTableProps) {
  const sortedEvents = useMemo(() => {
    if (!events) return null;
    return [...events].sort((a, b) => a.minute - b.minute || a.id - b.id);
  }, [events]);

  const columns: TableColumn<ScoringEvent>[] = [
    {
      header: "Minuto",
      render: (event) => (
        <span className="badge rounded-pill bg-dark px-2 py-1">
          {event.minute}&apos;
        </span>
      ),
    },
    {
      header: "Tipo",
      render: (event) => (
        <span className="badge rounded-pill badge-sports">{event.type}</span>
      ),
    },
    {
      header: "Equipo",
      render: (event) => (
        <span className="fw-semibold">
          {event.team?.name ||
            teamsById.get(Number(event.teamId))?.name ||
            `Equipo #${event.teamId}`}
        </span>
      ),
    },
    {
      header: "Jugador",
      render: (event) => {
        const player = playersById.get(Number(event.playerId));
        const userId = player?.userId;
        const user =
          userId !== undefined ? usersById.get(Number(userId)) : undefined;
        const doc = event.player?.document || player?.document;
        const jersey = event.player?.jerseyNumber ?? player?.jerseyNumber;

        return (
          <div>
            {user ? (
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
            ) : usersLoaded && userId !== undefined ? (
              <div>
                <CBadge color="danger" shape="rounded-pill">
                  Cuenta eliminada (ID #{userId})
                </CBadge>
              </div>
            ) : (
              <div className="fw-semibold">
                {userId !== undefined
                  ? `Usuario #${userId}`
                  : `Jugador #${event.playerId}`}
              </div>
            )}
            <div className="text-body-secondary small">
              {doc ? `Doc: ${doc}` : `Jugador #${event.playerId}`}
              {jersey !== null && jersey !== undefined ? ` • #${jersey}` : ""}
            </div>
          </div>
        );
      },
    },
    {
      header: "Acciones",
      render: (event) =>
        isBlocked ? (
          <span className="text-body-secondary small">—</span>
        ) : (
          <div className="d-flex align-items-center gap-1">
            <CTooltip content="Editar anotación">
              <button
                type="button"
                className="btn btn-sm btn-sports-edit btn-icon-action shadow-sm"
                aria-label="Editar anotación"
                onClick={() => onEdit(event)}
              >
                <CIcon icon={cilPencil} size="sm" />
              </button>
            </CTooltip>
            <CTooltip content="Eliminar anotación">
              <button
                type="button"
                className="btn btn-sm btn-danger text-white btn-icon-action shadow-sm"
                aria-label="Eliminar anotación"
                onClick={() => onDelete(event)}
              >
                <CIcon icon={cilTrash} size="sm" />
              </button>
            </CTooltip>
          </div>
        ),
    },
  ];

  return (
    <GenericTable<ScoringEvent>
      data={sortedEvents}
      columns={columns}
      getKey={(event) => event.id}
      isLoading={isLoading}
      emptyMessage="Aún no hay anotaciones registradas en este partido."
      errorMessage={errorMessage}
    />
  );
}
