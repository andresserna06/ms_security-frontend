import React, { useEffect, useMemo, useState } from "react";
import { Match } from "../../models/Match";
import { Phase } from "../../models/Phase";
import { Team } from "../../models/Team";
import { Tournament } from "../../models/Tournament";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

export interface MatchFormValues {
  tournamentId: number;
  phaseId: number;
  homeTeamId?: number;
  awayTeamId?: number;
  scheduledAt: string;
}

interface MatchFormModalProps {
  visible: boolean;
  match: Match | null;
  tournaments: Tournament[];
  phases: Phase[];
  teams: Team[];
  groupTeamsByPhaseId: Record<number, Team[]>;
  confirmedTeamsByTournamentId: Record<number, Team[]>;
  defaultTournamentId?: string;
  defaultPhaseId?: string;
  submitting: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: MatchFormValues) => Promise<void>;
}

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function MatchFormModal({
  visible,
  match,
  tournaments,
  phases,
  teams,
  groupTeamsByPhaseId,
  confirmedTeamsByTournamentId,
  defaultTournamentId = "",
  defaultPhaseId = "",
  submitting,
  error,
  fieldErrors = {},
  onClose,
  onSubmit,
}: MatchFormModalProps) {
  const [tournamentId, setTournamentId] = useState<string>("");
  const [phaseId, setPhaseId] = useState<string>("");
  const [homeTeamId, setHomeTeamId] = useState<string>("");
  const [awayTeamId, setAwayTeamId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const phasesByTournament = useMemo(() => {
    if (!tournamentId) return [];
    return phases.filter((phase) => String(phase.tournamentId) === tournamentId);
  }, [phases, tournamentId]);

  const groupedPhases = useMemo(() => {
    const groups = new Map<number, Phase[]>();
    [...phasesByTournament]
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .forEach((phase) => {
        const list = groups.get(phase.order) ?? [];
        list.push(phase);
        groups.set(phase.order, list);
      });
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [phasesByTournament]);

  const selectedPhase = useMemo(
    () => phasesByTournament.find((phase) => String(phase.id) === phaseId) ?? null,
    [phasesByTournament, phaseId],
  );

  const availableTeams = useMemo(() => {
    if (!selectedPhase || !tournamentId) return [];
    if (selectedPhase.phaseType === "GROUP") {
      return groupTeamsByPhaseId[selectedPhase.id] ?? [];
    }
    return confirmedTeamsByTournamentId[Number(tournamentId)] ?? teams;
  }, [selectedPhase, tournamentId, groupTeamsByPhaseId, confirmedTeamsByTournamentId, teams]);

  const homeTeamOptions = useMemo(
    () => availableTeams.filter((team) => String(team.id) !== awayTeamId),
    [availableTeams, awayTeamId],
  );

  const awayTeamOptions = useMemo(
    () => availableTeams.filter((team) => String(team.id) !== homeTeamId),
    [availableTeams, homeTeamId],
  );

  const selectedTournament = useMemo(
    () => tournaments.find((t) => String(t.id) === tournamentId) ?? null,
    [tournaments, tournamentId],
  );

  useEffect(() => {
    if (!visible) return;
    const matchPhase = match ? phases.find((p) => p.id === match.phaseId) : null;
    const nextTournamentId = matchPhase?.tournamentId ? String(matchPhase.tournamentId) : defaultTournamentId;
    const nextPhaseId = match ? String(match.phaseId) : defaultPhaseId;
    setTournamentId(nextTournamentId || "");
    setPhaseId(nextPhaseId || "");
    setHomeTeamId(match?.homeTeamId ? String(match.homeTeamId) : "");
    setAwayTeamId(match?.awayTeamId ? String(match.awayTeamId) : "");
    setScheduledAt(toLocalInput(match?.scheduledAt ?? ""));
    setLocalErrors({});
  }, [visible, match, phases, defaultTournamentId, defaultPhaseId]);

  useEffect(() => {
    if (!visible) return;
    if (phaseId && !phasesByTournament.some((phase) => String(phase.id) === phaseId)) {
      setPhaseId("");
      setHomeTeamId("");
      setAwayTeamId("");
    }
  }, [visible, phaseId, phasesByTournament]);

  useEffect(() => {
    if (!visible) return;
    if (homeTeamId && !availableTeams.some((team) => String(team.id) === homeTeamId)) {
      setHomeTeamId("");
    }
    if (awayTeamId && !availableTeams.some((team) => String(team.id) === awayTeamId)) {
      setAwayTeamId("");
    }
  }, [visible, homeTeamId, awayTeamId, availableTeams]);

  const validate = (): MatchFormValues | null => {
    const errors: Record<string, string> = {};
    if (!tournamentId) errors.tournamentId = "Debes seleccionar un torneo.";
    if (!phaseId) errors.phaseId = "Debes seleccionar una fase.";
    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      errors.awayTeamId = "El equipo local y visitante no pueden ser el mismo.";
    }
    if (!scheduledAt) {
      errors.scheduledAt = "La fecha y hora son obligatorias.";
    } else {
      const date = new Date(scheduledAt);
      if (Number.isNaN(date.getTime())) {
        errors.scheduledAt = "La fecha y hora no son válidas.";
      } else if (selectedTournament?.startDate) {
        const tournamentStart = new Date(`${selectedTournament.startDate}T00:00:00`);
        if (date < tournamentStart) {
          errors.scheduledAt = "La fecha no puede ser anterior al inicio del torneo.";
        }
      }
    }
    setLocalErrors(errors);
    if (Object.keys(errors).length > 0) return null;
    return {
      tournamentId: Number(tournamentId),
      phaseId: Number(phaseId),
      homeTeamId: homeTeamId ? Number(homeTeamId) : undefined,
      awayTeamId: awayTeamId ? Number(awayTeamId) : undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = validate();
    if (!values) return;
    await onSubmit(values);
  };

  const mergedErrors = { ...fieldErrors, ...localErrors };

  return (
    <GenericModal
      visible={visible}
      title={match ? "Editar partido" : "Crear partido"}
      onClose={submitting ? () => {} : onClose}
      backdrop={submitting ? "static" : true}
      footer={
        <>
          <GenericButton label="Cancelar" variant="secondary" onClick={onClose} disabled={submitting} />
          <button type="submit" form="match-form" className="btn btn-sports-primary" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <form id="match-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert type="danger" message={error} onClose={() => {}} /> : null}

        <div className="mb-3">
          <label htmlFor="match-tournament" className="form-label">Torneo <span className="text-danger">*</span></label>
          <select
            id="match-tournament"
            className={`form-select ${mergedErrors.tournamentId ? "is-invalid" : ""}`}
            value={tournamentId}
            onChange={(e) => {
              setTournamentId(e.target.value);
              setPhaseId("");
              setHomeTeamId("");
              setAwayTeamId("");
            }}
            disabled={submitting}
          >
            <option value="">Seleccione un torneo</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={String(tournament.id)}>{tournament.name}</option>
            ))}
          </select>
          {mergedErrors.tournamentId ? <div className="invalid-feedback">{mergedErrors.tournamentId}</div> : null}
        </div>

        <div className="mb-3">
          <label htmlFor="match-phase" className="form-label">Fase <span className="text-danger">*</span></label>
          <select
            id="match-phase"
            className={`form-select ${mergedErrors.phaseId ? "is-invalid" : ""}`}
            value={phaseId}
            onChange={(e) => {
              setPhaseId(e.target.value);
              setHomeTeamId("");
              setAwayTeamId("");
            }}
            disabled={submitting || !tournamentId}
          >
            <option value="">Seleccione una fase</option>
            {groupedPhases.map(([order, items]) => (
              <optgroup key={order} label={`Etapa ${order}`}>
                {items.map((phase) => (
                  <option key={phase.id} value={String(phase.id)}>{phase.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {mergedErrors.phaseId ? <div className="invalid-feedback">{mergedErrors.phaseId}</div> : null}
        </div>

        <div className="mb-3">
          <label htmlFor="match-home-team" className="form-label">Equipo local</label>
          <select
            id="match-home-team"
            className={`form-select ${mergedErrors.homeTeamId ? "is-invalid" : ""}`}
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.target.value)}
            disabled={submitting || !phaseId}
          >
            <option value="">Por definir</option>
            {homeTeamOptions.map((team) => (
              <option key={team.id} value={String(team.id)}>{team.name}</option>
            ))}
          </select>
          {mergedErrors.homeTeamId ? <div className="invalid-feedback">{mergedErrors.homeTeamId}</div> : null}
        </div>

        <div className="mb-3">
          <label htmlFor="match-away-team" className="form-label">Equipo visitante</label>
          <select
            id="match-away-team"
            className={`form-select ${mergedErrors.awayTeamId ? "is-invalid" : ""}`}
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.target.value)}
            disabled={submitting || !phaseId}
          >
            <option value="">Por definir</option>
            {awayTeamOptions.map((team) => (
              <option key={team.id} value={String(team.id)}>{team.name}</option>
            ))}
          </select>
          {mergedErrors.awayTeamId ? <div className="invalid-feedback">{mergedErrors.awayTeamId}</div> : null}
        </div>

        <div className="mb-3">
          <label htmlFor="match-scheduled-at" className="form-label">Fecha y hora <span className="text-danger">*</span></label>
          <input
            id="match-scheduled-at"
            type="datetime-local"
            className={`form-control ${mergedErrors.scheduledAt ? "is-invalid" : ""}`}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={submitting || !phaseId}
          />
          {mergedErrors.scheduledAt ? <div className="invalid-feedback">{mergedErrors.scheduledAt}</div> : null}
        </div>
      </form>
    </GenericModal>
  );
}
