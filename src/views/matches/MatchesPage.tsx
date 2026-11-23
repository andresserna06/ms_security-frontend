import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Match, MatchFinishPayload } from "../../models/Match";
import { Phase } from "../../models/Phase";
import { Team } from "../../models/Team";
import { Tournament } from "../../models/Tournament";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import MatchFilters from "./MatchFilters";
import MatchesTable from "./MatchesTable";
import MatchFormModal, { MatchFormValues } from "./MatchFormModal";

function getErrorFieldErrors(err: unknown): Record<string, string> {
  if (err && typeof err === "object" && "fieldErrors" in err) {
    const value = (err as { fieldErrors?: unknown }).fieldErrors;
    if (value && typeof value === "object") return value as Record<string, string>;
  }
  return {};
}

export default function MatchesPage() {
  const {
    matchService,
    phaseService,
    tournamentService,
    teamService,
    groupService,
    registrationService,
  } = serviceContainer;

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[] | null>(null);

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [matchToFinish, setMatchToFinish] = useState<Match | null>(null);

  const [groupTeamsByPhaseId, setGroupTeamsByPhaseId] = useState<Record<number, Team[]>>({});
  const [confirmedTeamsByTournamentId, setConfirmedTeamsByTournamentId] = useState<Record<number, Team[]>>({});

  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const phasesById = useMemo(() => new Map(phases.map((phase) => [phase.id, phase])), [phases]);

  const tournamentPhases = useMemo(
    () =>
      !selectedTournamentId
        ? []
        : phases.filter((phase) => String(phase.tournamentId) === selectedTournamentId),
    [phases, selectedTournamentId],
  );

  const filteredMatches = useMemo(() => {
    if (!matches) return null;
    const query = searchTerm.trim().toLowerCase();
    return matches.filter((match) => {
      if (selectedTournamentId) {
        const phase = phasesById.get(match.phaseId);
        if (String(phase?.tournamentId ?? "") !== selectedTournamentId) return false;
      }
      if (selectedPhaseId && String(match.phaseId) !== selectedPhaseId) return false;
      if (!query) return true;
      const phaseName = phasesById.get(match.phaseId)?.name?.toLowerCase() ?? "";
      const home = teamsById.get(match.homeTeamId ?? -1)?.name?.toLowerCase() ?? "por definir";
      const away = teamsById.get(match.awayTeamId ?? -1)?.name?.toLowerCase() ?? "por definir";
      return (
        phaseName.includes(query) ||
        home.includes(query) ||
        away.includes(query) ||
        match.status.toLowerCase().includes(query)
      );
    });
  }, [matches, selectedTournamentId, selectedPhaseId, searchTerm, phasesById, teamsById]);

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setPageError(null);
    try {
      const [tournamentsData, teamsData, phasesData] = await Promise.all([
        tournamentService.getAll(),
        teamService.getAll(),
        phaseService.getAll(),
      ]);
      setTournaments(tournamentsData);
      setTeams(teamsData);
      setPhases(phasesData);
    } catch (err: any) {
      setPageError(err?.message || "No fue posible cargar los catálogos.");
    } finally {
      setLoadingCatalogs(false);
    }
  }, [tournamentService, teamService, phaseService]);

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    setTableError(undefined);
    try {
      const data = selectedPhaseId
        ? await matchService.getByPhase(Number(selectedPhaseId))
        : await matchService.getAll();
      setMatches(data);
    } catch (err: any) {
      setMatches(null);
      setTableError(err?.message || "No fue posible obtener los partidos.");
    } finally {
      setLoadingMatches(false);
    }
  }, [matchService, selectedPhaseId]);

  const loadConfirmedTeams = useCallback(
    async (tournamentId: number) => {
      if (confirmedTeamsByTournamentId[tournamentId]) return;
      const registrations = await registrationService.getByTournament(tournamentId);
      const confirmed = registrations
        .filter((registration) => registration.status === "CONFIRMED")
        .map((registration) => {
          const team = teamsById.get(registration.teamId);
          return (
            team ??
            ({
              id: registration.teamId,
              name: registration.teamName ?? `Equipo #${registration.teamId}`,
            } as Team)
          );
        })
        .filter((team, index, arr) => arr.findIndex((item) => item.id === team.id) === index);
      setConfirmedTeamsByTournamentId((prev) => ({ ...prev, [tournamentId]: confirmed }));
    },
    [registrationService, teamsById, confirmedTeamsByTournamentId],
  );

  const loadGroupTeams = useCallback(
    async (phaseId: number) => {
      if (groupTeamsByPhaseId[phaseId]) return;
      const groupTeams = await groupService.getTeams(phaseId);
      const mapped = groupTeams
        .map((item) => teamsById.get(item.id) ?? ({ id: item.id, name: item.name } as Team))
        .filter((team, index, arr) => arr.findIndex((item) => item.id === team.id) === index);
      setGroupTeamsByPhaseId((prev) => ({ ...prev, [phaseId]: mapped }));
    },
    [groupService, teamsById, groupTeamsByPhaseId],
  );

  const ensureFormDependencies = useCallback(
    async (tournamentId?: string, phaseId?: string) => {
      const numericTournamentId = Number(tournamentId);
      if (Number.isInteger(numericTournamentId) && numericTournamentId > 0) {
        try {
          await loadConfirmedTeams(numericTournamentId);
        } catch {
          // El formulario mostrará opciones vacías si no hay datos disponibles.
        }
      }
      const numericPhaseId = Number(phaseId);
      const phase = phases.find((item) => item.id === numericPhaseId);
      if (phase?.phaseType === "GROUP") {
        try {
          await loadGroupTeams(phase.id);
        } catch {
          // El formulario mostrará opciones vacías si no hay datos disponibles.
        }
      }
    },
    [loadConfirmedTeams, loadGroupTeams, phases],
  );

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    if (selectedTournamentId) {
      void ensureFormDependencies(selectedTournamentId, selectedPhaseId);
    }
  }, [selectedTournamentId, selectedPhaseId, ensureFormDependencies]);

  const openCreate = async () => {
    setEditingMatch(null);
    setFormError(null);
    setFormFieldErrors({});
    await ensureFormDependencies(selectedTournamentId, selectedPhaseId);
    setShowForm(true);
  };

  const openEdit = async (match: Match) => {
    const phase = phasesById.get(match.phaseId);
    const tournamentId = phase?.tournamentId ? String(phase.tournamentId) : selectedTournamentId;
    setEditingMatch(match);
    setFormError(null);
    setFormFieldErrors({});
    await ensureFormDependencies(tournamentId, String(match.phaseId));
    setShowForm(true);
  };

  const handleSubmit = async (values: MatchFormValues) => {
    setSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});
    setSuccess(null);
    try {
      if (editingMatch) {
        await matchService.update(editingMatch.id, {
          scheduledAt: values.scheduledAt,
          phaseId: values.phaseId,
          homeTeamId: values.homeTeamId,
          awayTeamId: values.awayTeamId,
        });
        setSuccess("Partido actualizado correctamente.");
      } else {
        await matchService.create(values.phaseId, {
          scheduledAt: values.scheduledAt,
          homeTeamId: values.homeTeamId,
          awayTeamId: values.awayTeamId,
        });
        setSuccess("Partido creado correctamente.");
      }
      setShowForm(false);
      setEditingMatch(null);
      await loadMatches();
    } catch (err: any) {
      setFormError(err?.message || "No fue posible guardar el partido.");
      setFormFieldErrors(getErrorFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async (match: Match) => {
    setActionLoading(true);
    setPageError(null);
    setSuccess(null);
    try {
      await matchService.start(match.id);
      setSuccess("Partido iniciado correctamente.");
      await loadMatches();
    } catch (err: any) {
      setPageError(err?.message || "No fue posible iniciar el partido.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!matchToDelete) return;
    setActionLoading(true);
    setPageError(null);
    setSuccess(null);
    try {
      await matchService.remove(matchToDelete.id);
      setMatchToDelete(null);
      setSuccess("Partido eliminado correctamente.");
      await loadMatches();
    } catch (err: any) {
      setPageError(err?.message || "No fue posible eliminar el partido.");
      setMatchToDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!matchToFinish) return;
    setActionLoading(true);
    setPageError(null);
    setSuccess(null);
    try {
      const payload: MatchFinishPayload = {
        homeScore: matchToFinish.homeScore ?? 0,
        awayScore: matchToFinish.awayScore ?? 0,
      };
      await matchService.finish(matchToFinish.id, payload);
      setMatchToFinish(null);
      setSuccess("Partido finalizado correctamente.");
      await loadMatches();
    } catch (err: any) {
      setPageError(err?.message || "No fue posible finalizar el partido.");
      setMatchToFinish(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando partidos..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Partidos</h2>
        </div>
        <button type="button" className="btn btn-sports-primary" onClick={openCreate}>
          Crear partido
        </button>
      </div>

      {pageError ? <Alert type="danger" message={pageError} onClose={() => setPageError(null)} /> : null}
      {success ? <Alert type="success" message={success} onClose={() => setSuccess(null)} /> : null}

      <div className="card shadow-sm">
        <div className="card-body">
          <MatchFilters
            tournaments={tournaments}
            phases={tournamentPhases}
            selectedTournamentId={selectedTournamentId}
            selectedPhaseId={selectedPhaseId}
            searchTerm={searchTerm}
            onTournamentChange={(value) => {
              setSelectedTournamentId(value);
              setSelectedPhaseId("");
              setSuccess(null);
            }}
            onPhaseChange={setSelectedPhaseId}
            onSearchChange={setSearchTerm}
          />

          <MatchesTable
            matches={filteredMatches}
            phasesById={phasesById}
            teamsById={teamsById}
            isLoading={loadingMatches}
            errorMessage={tableError}
            onStart={handleStart}
            onEdit={openEdit}
            onDelete={(match) => setMatchToDelete(match)}
            onFinish={(match) => setMatchToFinish(match)}
          />
        </div>
      </div>

      <MatchFormModal
        visible={showForm}
        match={editingMatch}
        tournaments={tournaments}
        phases={phases}
        teams={teams}
        groupTeamsByPhaseId={groupTeamsByPhaseId}
        confirmedTeamsByTournamentId={confirmedTeamsByTournamentId}
        defaultTournamentId={selectedTournamentId}
        defaultPhaseId={selectedPhaseId}
        submitting={submitting}
        error={formError}
        fieldErrors={formFieldErrors}
        onClose={() => {
          if (!submitting) setShowForm(false);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        visible={Boolean(matchToDelete)}
        title="Eliminar partido"
        message={<p className="mb-0">¿Desea eliminar este partido?</p>}
        confirmLabel="Eliminar"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!actionLoading) setMatchToDelete(null);
        }}
      />

      <ConfirmModal
        visible={Boolean(matchToFinish)}
        title="Finalizar partido"
        message={
          <p className="mb-0">
            ¿Desea finalizar este partido con el marcador{" "}
            <strong>
              {matchToFinish?.homeScore ?? 0} - {matchToFinish?.awayScore ?? 0}
            </strong>
            ? El marcador se muestra solo como referencia.
          </p>
        }
        confirmLabel="Finalizar"
        isLoading={actionLoading}
        onConfirm={handleFinish}
        onCancel={() => {
          if (!actionLoading) setMatchToFinish(null);
        }}
      />


    </div>
  );
}
