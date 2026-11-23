import React from "react";
import { Tournament } from "../../models/Tournament";

interface RegistrationFiltersProps {
  tournaments: Tournament[];
  selectedTournamentId: string;
  searchTerm: string;
  isLoading: boolean;
  onTournamentChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function RegistrationFilters({
  tournaments,
  selectedTournamentId,
  searchTerm,
  isLoading,
  onTournamentChange,
  onSearchChange,
}: RegistrationFiltersProps) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-6 col-lg-5">
        <label htmlFor="registration-team-search" className="form-label fw-semibold">
          Buscar equipo
        </label>
        <input
          id="registration-team-search"
          name="teamSearch"
          type="text"
          className="form-control"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nombre o ID del equipo"
        />
      </div>
      <div className="col-md-6 col-lg-5">
        <label htmlFor="registration-tournament" className="form-label fw-semibold">
          Torneo
        </label>
        <select
          id="registration-tournament"
          className="form-select"
          value={selectedTournamentId}
          onChange={(e) => onTournamentChange(e.target.value)}
          disabled={isLoading}
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
    </div>
  );
}
