import React from "react";
import { OverviewMatch } from "../../models/TournamentOverview";
import {
  formatDateTime,
  matchStatusBadge,
  matchStatusLabel,
  scoringTypeLabel,
} from "../../utils/matchStatus";
import TeamLogo from "../../components/common/TeamLogo";

export interface OverviewMatchesTableProps {
  matches: OverviewMatch[];
  logos: Map<number, string | null | undefined>;
}

// Matches of a phase: whether each one has a result and its scoring events.
export default function OverviewMatchesTable({
  matches,
  logos,
}: OverviewMatchesTableProps) {
  if (matches.length === 0) {
    return (
      <div className="alert alert-info mb-0">
        Esta fase aún no tiene partidos programados.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Local</th>
            <th className="text-center">Marcador</th>
            <th>Visitante</th>
            <th>Estado</th>
            <th>Resultado</th>
            <th>Anotaciones</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id}>
              <td className="small text-nowrap">{formatDateTime(match.scheduledAt)}</td>
              <td className="fw-semibold">
                {match.homeTeam ? (
                  <div className="d-flex align-items-center gap-2">
                    <TeamLogo
                      name={match.homeTeam.name}
                      logo={logos.get(match.homeTeam.id)}
                      size={24}
                    />
                    <span>{match.homeTeam.name}</span>
                  </div>
                ) : (
                  <span className="text-body-secondary fst-italic">Por definir</span>
                )}
              </td>
              <td className="text-center">
                {match.hasResult ? (
                  <span className="badge rounded-pill bg-dark fs-6">
                    {match.homeScore} - {match.awayScore}
                  </span>
                ) : (
                  <span className="text-body-secondary">vs</span>
                )}
              </td>
              <td className="fw-semibold">
                {match.awayTeam ? (
                  <div className="d-flex align-items-center gap-2">
                    <TeamLogo
                      name={match.awayTeam.name}
                      logo={logos.get(match.awayTeam.id)}
                      size={24}
                    />
                    <span>{match.awayTeam.name}</span>
                  </div>
                ) : (
                  <span className="text-body-secondary fst-italic">Por definir</span>
                )}
              </td>
              <td>
                <span className={`badge rounded-pill ${matchStatusBadge(match.status)}`}>
                  {matchStatusLabel(match.status)}
                </span>
              </td>
              <td>
                <span
                  className={`badge rounded-pill ${
                    match.hasResult ? "badge-sports" : "bg-light text-dark border"
                  }`}
                >
                  {match.hasResult ? "Registrado" : "Pendiente"}
                </span>
              </td>
              <td>
                {match.scoringEvents.length === 0 ? (
                  <span className="text-body-secondary fst-italic small">
                    Sin anotaciones
                  </span>
                ) : (
                  <ul className="list-unstyled mb-0 small">
                    {match.scoringEvents.map((event) => (
                      <li key={event.id} className="text-nowrap">
                        <span className="fw-semibold">{event.minute}'</span>{" "}
                        {event.team.name} · Jugador {event.player.document}{" "}
                        <span className="text-body-secondary">
                          ({scoringTypeLabel(event.type)})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
