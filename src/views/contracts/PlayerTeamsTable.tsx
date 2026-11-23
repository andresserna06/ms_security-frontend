import React from "react";
import { CTooltip } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBan } from "@coreui/icons";
import { PlayerTeamContract } from "../../models/PlayerContract";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

export interface PlayerTeamsTableProps {
  contracts: PlayerTeamContract[] | null;
  isLoading: boolean;
  errorMessage?: string;
  onEndContract: (contract: PlayerTeamContract) => void;
}

export default function PlayerTeamsTable({
  contracts,
  isLoading,
  errorMessage = "No fue posible obtener el historial de equipos del jugador.",
  onEndContract,
}: PlayerTeamsTableProps) {
  const columns: TableColumn<PlayerTeamContract>[] = [
    {
      header: "Equipo",
      render: (contract) => (
        <div>
          <div className="fw-semibold">
            {contract.team?.name || `Equipo #${contract.teamId}`}
          </div>
          <div className="text-body-secondary small">
            {contract.team?.city || "Sin ciudad"}
          </div>
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
      header: "Estado contrato",
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
          <CTooltip content="Finalizar contrato">
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
    <GenericTable<PlayerTeamContract>
      data={contracts}
      columns={columns}
      getKey={(contract) => contract.id}
      isLoading={isLoading}
      emptyMessage="Este jugador no tiene contratos registrados con el filtro seleccionado."
      errorMessage={errorMessage}
    />
  );
}
