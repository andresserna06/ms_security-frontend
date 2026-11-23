import React from "react";
import { PlayerTeamContract } from "../../models/PlayerContract";

export interface ProfileTeamsCardProps {
  teams: PlayerTeamContract[];
  teamsMessage: string | null;
}

export default function ProfileTeamsCard({
  teams,
  teamsMessage,
}: ProfileTeamsCardProps) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Equipos asociados</span>
        <span className="badge rounded-pill badge-sports">{teams.length}</span>
      </div>
      <div className="card-body">
        {teams.length === 0 ? (
          <div className="alert alert-info mb-0">
            {teamsMessage || "El jugador no tiene equipos asociados"}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((contract) => (
                  <tr key={contract.id}>
                    <td>
                      <div className="fw-semibold">
                        {contract.team?.name || `Equipo #${contract.teamId}`}
                      </div>
                      <div className="text-body-secondary small">
                        {contract.team?.city || "Sin ciudad"}
                      </div>
                    </td>
                    <td className="small">{contract.startDate}</td>
                    <td className="small">
                      {contract.endDate || (
                        <span className="text-body-secondary fst-italic">
                          Indefinido
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          contract.current ? "badge-sports" : "bg-secondary"
                        }`}
                      >
                        {contract.current ? "Vigente" : "Finalizado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
