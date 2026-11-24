import React from "react";
import {
  FinalRound,
  OverviewBracketMatch,
  OverviewPhase,
  OverviewTeam,
} from "../../models/TournamentOverview";
import { matchStatusBadge, matchStatusLabel } from "../../utils/matchStatus";
import TeamLogo from "../../components/common/TeamLogo";

const FINAL_ROUND_LABELS: Record<FinalRound, string> = {
  ROUND_OF_16: "Octavos de final",
  QUARTERFINAL: "Cuartos de final",
  SEMIFINAL: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

export interface BracketCardProps {
  // Knockout phases in competition order; each one is a round of the bracket.
  rounds: OverviewPhase[];
  // Team crests by team id (taken once from the teams list).
  logos: Map<number, string | null | undefined>;
}

function TeamLine({
  team,
  score,
  isWinner,
  logo,
}: {
  team: OverviewTeam | null;
  score: number | null;
  isWinner: boolean;
  logo?: string | null;
}) {
  return (
    <div
      className={`d-flex justify-content-between align-items-center px-2 py-1 ${
        isWinner ? "fw-bold" : ""
      }`}
    >
      <span
        className={`d-flex align-items-center gap-2 ${
          team ? "" : "text-body-secondary fst-italic"
        }`}
      >
        {team ? <TeamLogo name={team.name} logo={logo} size={22} /> : null}
        {team?.name || "Por definir"}
      </span>
      <span className={`badge ${isWinner ? "badge-sports" : "bg-light text-dark border"}`}>
        {score ?? "-"}
      </span>
    </div>
  );
}

function Crossing({
  crossing,
  logos,
}: {
  crossing: OverviewBracketMatch;
  logos: Map<number, string | null | undefined>;
}) {
  const winnerId = crossing.winner?.id;
  const drawn =
    crossing.status === "FINISHED" &&
    crossing.homeScore !== null &&
    crossing.homeScore === crossing.awayScore;

  return (
    <div className="border rounded shadow-sm bg-body mb-2">
      <TeamLine
        team={crossing.homeTeam}
        logo={crossing.homeTeam ? logos.get(crossing.homeTeam.id) : null}
        score={crossing.homeScore}
        isWinner={Boolean(winnerId && winnerId === crossing.homeTeam?.id)}
      />
      <div className="border-top" />
      <TeamLine
        team={crossing.awayTeam}
        logo={crossing.awayTeam ? logos.get(crossing.awayTeam.id) : null}
        score={crossing.awayScore}
        isWinner={Boolean(winnerId && winnerId === crossing.awayTeam?.id)}
      />
      <div className="d-flex justify-content-between align-items-center gap-2 px-2 py-1 border-top small">
        <span
          className={`badge rounded-pill flex-shrink-0 ${matchStatusBadge(crossing.status)}`}
        >
          {matchStatusLabel(crossing.status)}
        </span>
        <span className="text-body-secondary text-end">
          {crossing.winner
            ? `Avanza: ${crossing.winner.name}`
            : drawn
              ? "Empate sin definir"
              : "Sin ganador aún"}
        </span>
      </div>
    </div>
  );
}

export default function BracketCard({ rounds, logos }: BracketCardProps) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Llaves de la fase final</span>
        <span className="badge rounded-pill badge-sports">
          {rounds.length} ronda(s)
        </span>
      </div>
      <div className="card-body">
        <div className="d-flex gap-3 overflow-auto pb-2">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="flex-shrink-0 d-flex flex-column"
              style={{ width: "270px" }}
            >
              {/* The standard round is the title; the phase name and order are the detail. */}
              <div className="text-center fw-semibold mb-2">
                {round.finalRound ? FINAL_ROUND_LABELS[round.finalRound] : round.name}
                <div className="text-body-secondary small fw-normal">
                  {round.finalRound && round.name !== FINAL_ROUND_LABELS[round.finalRound]
                    ? `${round.name} · Orden ${round.order}`
                    : `Orden ${round.order}`}
                </div>
              </div>
              {/* Later rounds are centered between the crossings that feed them. */}
              <div className="flex-grow-1 d-flex flex-column justify-content-around">
                {(round.bracket ?? []).length === 0 ? (
                  <div className="alert alert-info small mb-0">
                    Sin cruces programados.
                  </div>
                ) : (
                  (round.bracket ?? []).map((crossing) => (
                    <Crossing key={crossing.matchId} crossing={crossing} logos={logos} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-body-secondary small mt-2">
          Un partido de llave empatado queda sin ganador hasta que se defina la regla
          de desempate.
        </div>
      </div>
    </div>
  );
}
