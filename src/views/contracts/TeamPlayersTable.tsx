import React from "react";
import { CBadge, CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBan } from "@coreui/icons";
import { TeamPlayerContract } from "../../models/PlayerContract";
import { User } from "../../models/User";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface TeamPlayersTableProps {
  contracts: TeamPlayerContract[] | null;
  usersById: Map<number, User>;
  usersLoaded?: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onEndContract: (contract: TeamPlayerContract) => void;
}

export default function TeamPlayersTable({
  contracts,
  usersById,
  usersLoaded = false,
  isLoading,
  errorMessage = "No fue posible obtener los contratos del equipo.",
  onEndContract,
}: TeamPlayersTableProps) {
  const columns: TableColumn<TeamPlayerContract>[] = [
    {
      header: "Jugador",
      render: (contract) => {
        const userId = contract.player?.userId;
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
                Usuario #{userId ?? contract.playerId}
              </div>
              <div className="text-body-secondary small">
                Jugador #{contract.playerId}
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
              {user.email || `Jugador #${contract.playerId}`}
            </div>
          </div>
        );
      },
    },
    {
      header: "Documento",
      render: (contract) => (
        <span className="fw-semibold">{contract.player?.document || "—"}</span>
      ),
    },
    {
      header: "Posición / Dorsal",
      render: (contract) => (
        <div className="d-flex align-items-center gap-2">
          <span>
            {contract.player?.position || (
              <span className="text-body-secondary fst-italic">Sin definir</span>
            )}
          </span>
          {contract.player?.jerseyNumber !== null &&
          contract.player?.jerseyNumber !== undefined ? (
            <span className="badge rounded-pill bg-dark">
              #{contract.player.jerseyNumber}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Inicio",
      render: (contract) => <span className="small">{contract.startDate}</span>,
    },
    {
      header: "Fin",
      render: (contract) =>
        contract.endDate ? (
          <span className="small">{contract.endDate}</span>
        ) : (
          <span className="text-body-secondary small fst-italic">Indefinido</span>
        ),
    },
    {
      header: "Estado",
      render: (contract) => (
        <span
          className={`badge rounded-pill ${
            contract.current ? "badge-sports" : "bg-secondary"
          }`}
        >
          {contract.current ? "Vigente" : "Finalizado"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (contract) =>
        contract.current ? (
          <CTooltip content="Finalizar contrato (retirar del equipo)">
            <button
              type="button"
              className="btn btn-sm btn-sports-deactivate btn-icon-action shadow-sm"
              aria-label="Finalizar contrato"
              onClick={() => onEndContract(contract)}
            >
              <CIcon icon={cilBan} size="sm" />
            </button>
          </CTooltip>
        ) : (
          <span className="text-body-secondary small">—</span>
        ),
    },
  ];

  return (
    <GenericTable<TeamPlayerContract>
      data={contracts}
      columns={columns}
      getKey={(contract) => contract.id}
      isLoading={isLoading}
      emptyMessage="No hay contratos registrados para este equipo con el filtro seleccionado."
      errorMessage={errorMessage}
    />
  );
}
