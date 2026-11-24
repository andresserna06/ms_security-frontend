import React from "react";
import { OverviewPhase } from "../../models/TournamentOverview";
import StandingsTable from "./StandingsTable";
import OverviewMatchesTable from "./OverviewMatchesTable";

export interface OverviewPhaseCardProps {
  phase: OverviewPhase;
  logos: Map<number, string | null | undefined>;
}

export default function OverviewPhaseCard({ phase, logos }: OverviewPhaseCardProps) {
  const isGroup = phase.type === "GROUP_STAGE";
  const withResult = phase.matches.filter((m) => m.hasResult).length;
  const teams = phase.teams ?? [];

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill bg-dark">{phase.order}</span>
          <span className="fw-semibold">{phase.name}</span>
          <span
            className={`badge rounded-pill ${
              isGroup ? "badge-sports" : "bg-warning text-dark"
            }`}
          >
            {isGroup ? "Fase de grupos" : "Fase final"}
          </span>
          {isGroup ? (
            <span className="badge rounded-pill bg-light text-dark border">
              {teams.length} equipo(s)
            </span>
          ) : null}
        </div>
        <span className="text-body-secondary small">
          {withResult} de {phase.matches.length} partido(s) con resultado
        </span>
      </div>

      <div className="card-body">
        {/* The standings table lists every team of the group. */}
        {isGroup ? (
          <div className="mb-4">
            <div className="fw-semibold mb-2">Tabla de posiciones</div>
            <StandingsTable standings={phase.standings ?? []} logos={logos} />
            <div className="text-body-secondary small mt-2">
              PJ jugados · PG ganados · PE empatados · PP perdidos · AF anotaciones a
              favor · AC en contra · DIF diferencia · PTS puntos (victoria 3, empate 1).
            </div>
          </div>
        ) : null}

        <div className="fw-semibold mb-2">Partidos</div>
        <OverviewMatchesTable matches={phase.matches} logos={logos} />
      </div>
    </div>
  );
}
