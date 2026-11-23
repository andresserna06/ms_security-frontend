import React from "react";
import { Tournament } from "../../models/Tournament";
import { PhaseType } from "../../models/Phase";

interface PhaseFiltersProps {
  tournaments: Tournament[];
  selectedTournamentId: string;
  searchTerm: string;
  typeFilter: "ALL" | PhaseType;
  onTournamentChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: "ALL" | PhaseType) => void;
}

export default function PhaseFilters({
  tournaments,
  selectedTournamentId,
  searchTerm,
  typeFilter,
  onTournamentChange,
  onSearchChange,
  onTypeFilterChange,
}: PhaseFiltersProps) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-4">
        <label htmlFor="phase-tournament" className="form-label fw-semibold">
          Torneo
        </label>
        <select
          id="phase-tournament"
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
      <div className="col-md-4">
        <label htmlFor="phase-search" className="form-label fw-semibold">
          Buscar fase
        </label>
        <input
          id="phase-search"
          type="text"
          className="form-control"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nombre, orden o ronda"
        />
      </div>
      <div className="col-md-4">
        <label htmlFor="phase-type-filter" className="form-label fw-semibold">
          Tipo
        </label>
        <select
          id="phase-type-filter"
          className="form-select"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as "ALL" | PhaseType)}
        >
          <option value="ALL">Todos</option>
          <option value="GROUP">Grupo</option>
          <option value="FINAL">Final</option>
        </select>
      </div>
    </div>
  );
}
