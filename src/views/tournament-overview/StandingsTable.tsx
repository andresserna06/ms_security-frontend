import React from "react";
import { OverviewStanding } from "../../models/TournamentOverview";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";
import TeamLogo from "../../components/common/TeamLogo";

export interface StandingsTableProps {
  standings: OverviewStanding[];
  logos: Map<number, string | null | undefined>;
}

// Standings of a group phase. Calculated by ms_sports (only finished matches,
// win 3, draw 1, loss 0; ordered by points, goal difference, goals for, name).
export default function StandingsTable({ standings, logos }: StandingsTableProps) {
  const number = (value: number) => <span className="small">{value}</span>;

  const columns: TableColumn<OverviewStanding>[] = [
    {
      header: "#",
      render: (row) => (
        <span
          className={`badge rounded-pill ${
            row.position === 1 ? "badge-sports" : "bg-light text-dark border"
          }`}
        >
          {row.position}
        </span>
      ),
    },
    {
      header: "Equipo",
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <TeamLogo name={row.team.name} logo={logos.get(row.team.id)} size={26} />
          <span className="fw-semibold">{row.team.name}</span>
        </div>
      ),
    },
    { header: "PJ", render: (row) => number(row.played) },
    { header: "PG", render: (row) => number(row.won) },
    { header: "PE", render: (row) => number(row.drawn) },
    { header: "PP", render: (row) => number(row.lost) },
    { header: "AF", render: (row) => number(row.goalsFor) },
    { header: "AC", render: (row) => number(row.goalsAgainst) },
    {
      header: "DIF",
      render: (row) => (
        <span
          className={`small fw-semibold ${
            row.goalDifference > 0
              ? "text-success"
              : row.goalDifference < 0
                ? "text-danger"
                : ""
          }`}
        >
          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
        </span>
      ),
    },
    {
      header: "PTS",
      render: (row) => <span className="fw-bold">{row.points}</span>,
    },
  ];

  return (
    <GenericTable<OverviewStanding>
      data={standings}
      columns={columns}
      getKey={(row) => row.team.id}
      emptyMessage="El grupo aún no tiene equipos asignados."
    />
  );
}
