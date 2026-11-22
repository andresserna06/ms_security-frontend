import React from "react";
import { CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBan, cilCheckCircle, cilPencil, cilTrash } from "@coreui/icons";
import { Player } from "../../models/Player";
import { User } from "../../models/User";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface PlayersTableProps {
  players: Player[] | null;
  usersById: Map<number, User>;
  isLoading: boolean;
  errorMessage?: string;
  selectedPlayerId: number | null;
  onSelect: (player: Player) => void;
  onEdit: (player: Player) => void;
  onToggleStatus: (player: Player) => void;
  onDelete: (player: Player) => void;
}

export default function PlayersTable({
  players,
  usersById,
  isLoading,
  errorMessage = "No fue posible obtener la lista de jugadores.",
  selectedPlayerId,
  onSelect,
  onEdit,
  onToggleStatus,
  onDelete,
}: PlayersTableProps) {
  const columns: TableColumn<Player>[] = [
    {
      header: "ID",
      render: (player) => <span className="text-body-secondary">#{player.id}</span>,
    },
    {
      header: "Usuario",
      render: (player) => {
        const user = usersById.get(player.userId);
        return (
          <div>
            <div className="fw-semibold">
              {user?.name || `Usuario #${player.userId}`}
            </div>
            <div className="text-body-secondary small">
              {user?.email || `ID usuario: ${player.userId}`}
            </div>
          </div>
        );
      },
    },
    {
      header: "Documento",
      render: (player) => <span className="fw-semibold">{player.document}</span>,
    },
    {
      header: "Posición",
      render: (player) =>
        player.position ? (
          <span>{player.position}</span>
        ) : (
          <span className="text-body-secondary fst-italic">Sin definir</span>
        ),
    },
    {
      header: "Dorsal",
      render: (player) =>
        player.jerseyNumber !== null && player.jerseyNumber !== undefined ? (
          <span className="badge rounded-pill bg-dark">#{player.jerseyNumber}</span>
        ) : (
          <span className="text-body-secondary fst-italic">—</span>
        ),
    },
    {
      header: "Estado",
      render: (player) => (
        <span
          className={`badge rounded-pill ${
            player.active ? "badge-sports" : "bg-secondary"
          }`}
        >
          {player.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (player) => (
        <div
          className="d-flex align-items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <CTooltip content="Editar jugador">
            <button
              type="button"
              className="btn btn-sm btn-sports-edit btn-icon-action shadow-sm"
              aria-label="Editar jugador"
              onClick={() => onEdit(player)}
            >
              <CIcon icon={cilPencil} size="sm" />
            </button>
          </CTooltip>

          <CTooltip content={player.active ? "Desactivar jugador" : "Activar jugador"}>
            <button
              type="button"
              className={`btn btn-sm btn-icon-action shadow-sm ${
                player.active
                  ? "btn-sports-deactivate"
                  : "btn-sports-primary"
              }`}
              aria-label={player.active ? "Desactivar jugador" : "Activar jugador"}
              onClick={() => onToggleStatus(player)}
            >
              <CIcon icon={player.active ? cilBan : cilCheckCircle} size="sm" />
            </button>
          </CTooltip>

          <CTooltip content="Eliminar jugador">
            <button
              type="button"
              className="btn btn-sm btn-danger text-white btn-icon-action shadow-sm"
              aria-label="Eliminar jugador"
              onClick={() => onDelete(player)}
            >
              <CIcon icon={cilTrash} size="sm" />
            </button>
          </CTooltip>
        </div>
      ),
    },
  ];

  return (
    <GenericTable<Player>
      data={players}
      columns={columns}
      getKey={(player) => player.id}
      isLoading={isLoading}
      emptyMessage="No hay jugadores que coincidan con los filtros seleccionados."
      errorMessage={errorMessage}
      onRowClick={onSelect}
      selectedKey={selectedPlayerId}
    />
  );
}
