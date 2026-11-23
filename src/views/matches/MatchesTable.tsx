import React from "react";
import { CBadge } from "@coreui/react";
import { Match, MATCH_STATUS_COLORS, MATCH_STATUS_LABELS } from "../../models/Match";
import { Phase } from "../../models/Phase";
import { Team } from "../../models/Team";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

interface MatchesTableProps {
  matches: Match[] | null;
  phasesById: Map<number, Phase>;
  teamsById: Map<number, Team>;
  isLoading: boolean;
  errorMessage?: string;
  onStart: (match: Match) => void;
  onEdit: (match: Match) => void;
  onCancel: (match: Match) => void;
  onDelete: (match: Match) => void;
  onFinish: (match: Match) => void;
}

function formatDateTime(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function teamLabel(teamsById: Map<number, Team>, teamId: number | null): string {
  if (teamId === null || teamId === undefined) return "Por definir";
  return teamsById.get(teamId)?.name ?? `Equipo #${teamId}`;
}

export default function MatchesTable({
  matches,
  phasesById,
  teamsById,
  isLoading,
  errorMessage = "No fue posible obtener los partidos.",
  onStart,
  onEdit,
  onCancel,
  onDelete,
  onFinish,
}: MatchesTableProps) {
  const columns: TableColumn<Match>[] = [
    {
      header: "Fecha",
      render: (match) => formatDateTime(match.scheduledAt),
    },
    {
      header: "Local",
      render: (match) => teamLabel(teamsById, match.homeTeamId),
    },
    {
      header: "Visitante",
      render: (match) => teamLabel(teamsById, match.awayTeamId),
    },
    {
      header: "Marcador",
      render: (match) =>
        match.homeScore !== null && match.awayScore !== null
          ? `${match.homeScore} - ${match.awayScore}`
          : "- : -",
    },
    {
      header: "Estado",
      render: (match) => (
        <CBadge color={MATCH_STATUS_COLORS[match.status]} shape="rounded-pill">
          {MATCH_STATUS_LABELS[match.status]}
        </CBadge>
      ),
    },
    {
      header: "Fase",
      render: (match) => phasesById.get(match.phaseId)?.name ?? `Fase #${match.phaseId}`,
    },
    {
      header: "Acciones",
      render: (match) => (
        <div className="d-flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {match.status === "SCHEDULED" ? (
            <>
              <button type="button" className="btn btn-sm btn-outline-success" onClick={() => onStart(match)}>
                Iniciar
              </button>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(match)}>
                Editar
              </button>
              <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => onCancel(match)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(match)}>
                Eliminar
              </button>
            </>
          ) : null}
          {match.status === "IN_PROGRESS" ? (
            <>
              <button type="button" className="btn btn-sm btn-outline-success" onClick={() => onFinish(match)}>
                Finalizar
              </button>
              <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => onCancel(match)}>
                Cancelar
              </button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <GenericTable<Match>
      data={matches}
      columns={columns}
      getKey={(match) => match.id}
      isLoading={isLoading}
      emptyMessage="No hay partidos para el filtro seleccionado."
      errorMessage={errorMessage}
    />
  );
}
