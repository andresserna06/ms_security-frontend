import React, { useMemo } from "react";
import { Phase } from "../../models/Phase";
import { Tournament } from "../../models/Tournament";

interface MatchFiltersProps {
  tournaments: Tournament[];
  phases: Phase[];
  selectedTournamentId: string;
  selectedPhaseId: string;
  searchTerm: string;
  onTournamentChange: (value: string) => void;
  onPhaseChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function MatchFilters({
  tournaments,
  phases,
  selectedTournamentId,
  selectedPhaseId,
  searchTerm,
  onTournamentChange,
  onPhaseChange,
  onSearchChange,
}: MatchFiltersProps) {
  const groupedPhases = useMemo(() => {
    const groups = new Map<number, Phase[]>();
    [...phases]
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .forEach((phase) => {
        const list = groups.get(phase.order) ?? [];
        list.push(phase);
        groups.set(phase.order, list);
      });
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [phases]);

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-4">
        <label htmlFor="match-tournament-filter" className="form-label fw-semibold">
          Torneo
        </label>
        <select
          id="match-tournament-filter"
          className="form-select"
          value={selectedTournamentId}
          onChange={(e) => onTournamentChange(e.target.value)}
        >
          <option value="">Todos los torneos</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={String(tournament.id)}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-4">
        <label htmlFor="match-phase-filter" className="form-label fw-semibold">
          Fase
        </label>
        <select
          id="match-phase-filter"
          className="form-select"
          value={selectedPhaseId}
          onChange={(e) => onPhaseChange(e.target.value)}
          disabled={!selectedTournamentId}
        >
          <option value="">Todas las fases</option>
          {groupedPhases.map(([order, items]) => (
            <optgroup key={order} label={`Etapa ${order}`}>
              {items.map((phase) => (
                <option key={phase.id} value={String(phase.id)}>
                  {phase.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="col-md-4">
        <label htmlFor="match-search" className="form-label fw-semibold">
          Buscar
        </label>
        <input
          id="match-search"
          type="text"
          className="form-control"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Equipo, estado, fase..."
        />
      </div>
    </div>
  );
}
