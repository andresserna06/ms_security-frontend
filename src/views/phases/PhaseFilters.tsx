import React from "react";
import { Tournament } from "../../models/Tournament";

interface PhaseFiltersProps {
  tournaments: Tournament[];
  selectedTournamentId: string;
  searchTerm: string;
  onTournamentChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function PhaseFilters({
  tournaments,
  selectedTournamentId,
  searchTerm,
  onTournamentChange,
  onSearchChange,
}: PhaseFiltersProps) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-6 col-lg-5">
        <label htmlFor="final-phase-tournament" className="form-label fw-semibold">
          Torneo
        </label>
        <select
          id="final-phase-tournament"
          className="form-select"
          value={selectedTournamentId}
          onChange={(e) => onTournamentChange(e.target.value)}
        >
          <option value="">Seleccione un torneo</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={String(tournament.id)}>
              {tournament.name}
              {tournament.sportName ? ` - ${tournament.sportName}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-6 col-lg-5">
        <label htmlFor="final-phase-search" className="form-label fw-semibold">
          Buscar fase final
        </label>
        <input
          id="final-phase-search"
          type="text"
          className="form-control"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Orden o ronda"
        />
      </div>
    </div>
  );
}
