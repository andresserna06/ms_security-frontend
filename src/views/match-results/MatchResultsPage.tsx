import React, { useCallback, useEffect, useMemo, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";
import {
  FinishMatchPayload,
  Match,
  UpdateMatchResultPayload,
} from "../../models/Match";
import { Player } from "../../models/Player";
import { ScoringEvent, ScoringEventPayload } from "../../models/ScoringEvent";
import { Team } from "../../models/Team";
import { User } from "../../models/User";
import { IMatchResultService } from "../../services/interfaces/IMatchResultService";
import { ITeamService } from "../../services/interfaces/ITeamService";
import { IPlayerService } from "../../services/interfaces/IPlayerService";
import { IPlayerContractService } from "../../services/interfaces/IPlayerContractService";
import { IUserService } from "../../services/interfaces/IUserService";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import MatchScoreCard from "./MatchScoreCard";
import ScoringEventsTable from "./ScoringEventsTable";
import ScoringEventFormModal from "./ScoringEventFormModal";

export interface MatchResultsPageProps {
  matchResultService?: IMatchResultService;
  teamService?: ITeamService;
  playerService?: IPlayerService;
  playerContractService?: IPlayerContractService;
  userService?: IUserService;
}

export default function MatchResultsPage({
  matchResultService = serviceContainer.matchResultService,
  teamService = serviceContainer.teamService,
  playerService = serviceContainer.playerService,
  playerContractService = serviceContainer.playerContractService,
  userService = serviceContainer.userService,
}: MatchResultsPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState<boolean>(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<ScoringEvent[] | null>(null);
  const [loadingMatchData, setLoadingMatchData] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [savingResult, setSavingResult] = useState<boolean>(false);
  const [startingMatch, setStartingMatch] = useState<boolean>(false);
  const [pendingFinishPayload, setPendingFinishPayload] =
    useState<FinishMatchPayload | null>(null);
  const [finishingMatch, setFinishingMatch] = useState<boolean>(false);

  const [eventModalVisible, setEventModalVisible] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<ScoringEvent | null>(null);
  const [savingEvent, setSavingEvent] = useState<boolean>(false);

  const [eventToDelete, setEventToDelete] = useState<ScoringEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<boolean>(false);

  const teamsById = useMemo(() => {
    const map = new Map<number, Team>();
    teams.forEach((t) => map.set(Number(t.id), t));
    return map;
  }, [teams]);

  const playersById = useMemo(() => {
    const map = new Map<number, Player>();
    players.forEach((p) => map.set(Number(p.id), p));
    return map;
  }, [players]);

  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((u) => map.set(Number(u.id), u));
    return map;
  }, [users]);

  const getTeamName = useCallback(
    (teamId?: number | null, fallback = "Por definir"): string => {
      if (!teamId) return fallback;
      return teamsById.get(Number(teamId))?.name || `Equipo #${teamId}`;
    },
    [teamsById],
  );

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setError(null);
    try {
      const [allMatches, allTeams, allPlayers, allUsers] = await Promise.all([
        matchResultService.getAllMatches(),
        teamService.getAll(),
        playerService.getAll({ all: true }),
        userService.getAll(),
      ]);
      setMatches(allMatches);
      setTeams(allTeams);
      setPlayers(allPlayers);
      if (allUsers) {
        setUsers(allUsers);
        setUsersLoaded(true);
      }
      if (allMatches.length > 0) {
        setSelectedMatchId((prev) =>
          prev && allMatches.some((m) => m.id === prev) ? prev : allMatches[0].id,
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
        "No fue posible cargar los partidos, equipos y jugadores.",
      );
    } finally {
      setLoadingCatalogs(false);
    }
  }, [matchResultService, teamService, playerService, userService]);

  const loadSelectedMatchData = useCallback(
    async (matchId: number | null) => {
      if (!matchId) {
        setSelectedMatch(null);
        setEvents([]);
        return;
      }

      setLoadingMatchData(true);
      setError(null);
      try {
        const [matchDetail, matchEvents] = await Promise.all([
          matchResultService.getMatchById(matchId),
          matchResultService.getScoringEvents(matchId),
        ]);
        setSelectedMatch(matchDetail);
        setEvents(matchEvents);
        setMatches((prev) =>
          prev.map((m) => (m.id === matchDetail.id ? matchDetail : m)),
        );
      } catch (err: any) {
        setError(
          err?.message ||
          "No fue posible cargar el detalle y las anotaciones del partido.",
        );
        setEvents(null);
      } finally {
        setLoadingMatchData(false);
      }
    },
    [matchResultService],
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadSelectedMatchData(selectedMatchId);
  }, [selectedMatchId, loadSelectedMatchData]);

  const homeTeam = useMemo(
    () =>
      selectedMatch?.homeTeamId
        ? teamsById.get(Number(selectedMatch.homeTeamId)) ?? null
        : null,
    [selectedMatch, teamsById],
  );

  const awayTeam = useMemo(
    () =>
      selectedMatch?.awayTeamId
        ? teamsById.get(Number(selectedMatch.awayTeamId)) ?? null
        : null,
    [selectedMatch, teamsById],
  );

  const hasBothTeams = Boolean(
    selectedMatch?.homeTeamId && selectedMatch?.awayTeamId,
  );
  const isCancelled = selectedMatch?.status === "CANCELLED";
  const isScheduled = selectedMatch?.status === "SCHEDULED";
  const isBlocked = !selectedMatch || isCancelled || !hasBothTeams;
  const areEventsBlocked = isBlocked || isScheduled;

  const handleStartMatch = async () => {
    if (!selectedMatchId) return;
    setStartingMatch(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await matchResultService.startMatch(selectedMatchId);
      setSelectedMatch(updated);
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      );
      setSuccess(
        "Partido iniciado correctamente. Ya puedes registrar anotaciones.",
      );
    } catch (err: any) {
      setError(err?.message || "No fue posible iniciar el partido.");
    } finally {
      setStartingMatch(false);
    }
  };

  const handleSaveResult = async (payload: UpdateMatchResultPayload) => {
    if (!selectedMatchId) return;
    setSavingResult(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await matchResultService.updateResult(
        selectedMatchId,
        payload,
      );
      setSelectedMatch(updated);
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      );
      setSuccess(
        `Resultado actualizado: ${getTeamName(updated.homeTeamId)} ${updated.homeScore ?? 0} - ${updated.awayScore ?? 0} ${getTeamName(updated.awayTeamId)}.`,
      );
    } catch (err: any) {
      setError(err?.message || "No fue posible actualizar el resultado.");
    } finally {
      setSavingResult(false);
    }
  };

  const handleConfirmFinish = async () => {
    if (!selectedMatchId || !pendingFinishPayload) return;
    setFinishingMatch(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await matchResultService.finishMatch(
        selectedMatchId,
        pendingFinishPayload,
      );
      setSelectedMatch(updated);
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      );
      setPendingFinishPayload(null);
      setSuccess(
        "Partido finalizado correctamente. Se ha disparado el correo de resumen a los aficionados con boleto o apuesta.",
      );
    } catch (err: any) {
      setPendingFinishPayload(null);
      setError(err?.message || "No fue posible finalizar el partido.");
    } finally {
      setFinishingMatch(false);
    }
  };

  const handleSubmitScoringEvent = async (payload: ScoringEventPayload) => {
    if (!selectedMatchId) return;
    setSavingEvent(true);
    try {
      if (eventToEdit) {
        await matchResultService.updateScoringEvent(eventToEdit.id, payload);
        setSuccess("Anotación actualizada correctamente.");
      } else {
        await matchResultService.createScoringEvent(selectedMatchId, payload);
        setSuccess(
          "Anotación registrada correctamente. Se ha enviado la notificación a los aficionados interesados.",
        );
      }
      setEventModalVisible(false);
      setEventToEdit(null);
      await loadSelectedMatchData(selectedMatchId);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    if (!selectedMatchId || !eventToDelete) return;
    setDeletingEvent(true);
    setError(null);
    setSuccess(null);
    try {
      await matchResultService.deleteScoringEvent(eventToDelete.id);
      setEventToDelete(null);
      setSuccess(
        "Anotación eliminada correctamente. El partido y el jugador se mantienen intactos.",
      );
      await loadSelectedMatchData(selectedMatchId);
    } catch (err: any) {
      setEventToDelete(null);
      setError(err?.message || "No fue posible eliminar la anotación.");
    } finally {
      setDeletingEvent(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando partidos y equipos..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="mb-3">
        <h2 className="mb-0 fw-bold">Resultados y Anotaciones</h2>
      </div>

      {error ? (
        <Alert type="danger" message={error} onClose={() => setError(null)} />
      ) : null}
      {success ? (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      ) : null}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-8">
              <label htmlFor="select-match-results" className="form-label fw-semibold">
                Seleccionar partido
              </label>
              <select
                id="select-match-results"
                className="form-select"
                value={selectedMatchId ?? ""}
                onChange={(e) => {
                  setSuccess(null);
                  setSelectedMatchId(
                    e.target.value ? Number(e.target.value) : null,
                  );
                }}
                disabled={matches.length === 0}
              >
                {matches.length === 0 ? (
                  <option value="">No hay partidos registrados</option>
                ) : null}
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.id} — {getTeamName(m.homeTeamId)} vs{" "}
                    {getTeamName(m.awayTeamId)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 text-md-end">
              <span className="badge rounded-pill badge-sports px-3 py-2">
                {matches.length} partido(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {!selectedMatch ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5 text-body-secondary">
            Selecciona un partido registrado para gestionar su resultado y anotaciones.
          </div>
        </div>
      ) : (
        <>
          {isCancelled ? (
            <Alert
              type="danger"
              message="Este partido está CANCELADO. No es posible registrar o modificar resultados, finalizarlo ni gestionar anotaciones."
            />
          ) : !hasBothTeams ? (
            <Alert
              type="warning"
              message="Este partido aún no tiene ambos equipos participantes asignados (local y visitante). Asigna ambos equipos antes de registrar resultados o anotaciones."
            />
          ) : null}

          <MatchScoreCard
            match={selectedMatch}
            homeTeamName={getTeamName(selectedMatch.homeTeamId)}
            awayTeamName={getTeamName(selectedMatch.awayTeamId)}
            isBlocked={isBlocked}
            savingResult={savingResult}
            startingMatch={startingMatch}
            finishingMatch={finishingMatch}
            onSaveResult={handleSaveResult}
            onStartMatch={handleStartMatch}
            onRequestFinish={(payload) => setPendingFinishPayload(payload)}
          />

          <div className="card shadow-sm">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">Anotaciones del partido</span>
                <span className="badge rounded-pill badge-sports">
                  {events ? events.length : 0}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-sports-primary d-inline-flex align-items-center gap-1"
                disabled={areEventsBlocked}
                onClick={() => {
                  setEventToEdit(null);
                  setSuccess(null);
                  setEventModalVisible(true);
                }}
              >
                <CIcon icon={cilPlus} size="sm" />
                <span>Registrar anotación</span>
              </button>
            </div>
            <div className="card-body">
              {!isBlocked && isScheduled ? (
                <Alert
                  type="info"
                  message="Inicia el partido para poder registrar anotaciones."
                />
              ) : null}
              <ScoringEventsTable
                events={events}
                playersById={playersById}
                teamsById={teamsById}
                usersById={usersById}
                usersLoaded={usersLoaded}
                isLoading={loadingMatchData}
                isBlocked={areEventsBlocked}
                errorMessage={error || undefined}
                onEdit={(event) => {
                  setEventToEdit(event);
                  setSuccess(null);
                  setEventModalVisible(true);
                }}
                onDelete={(event) => setEventToDelete(event)}
              />
            </div>
          </div>
        </>
      )}

      <ScoringEventFormModal
        visible={eventModalVisible}
        eventToEdit={eventToEdit}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        matchScheduledAt={selectedMatch?.scheduledAt}
        usersById={usersById}
        usersLoaded={usersLoaded}
        playerContractService={playerContractService}
        submitting={savingEvent}
        onClose={() => {
          setEventModalVisible(false);
          setEventToEdit(null);
        }}
        onSubmit={handleSubmitScoringEvent}
      />

      <ConfirmModal
        visible={Boolean(pendingFinishPayload)}
        title="Finalizar partido"
        message={
          selectedMatch && pendingFinishPayload ? (
            <p className="mb-0">
              ¿Deseas finalizar el partido{" "}
              <strong>
                {getTeamName(selectedMatch.homeTeamId)}{" "}
                {pendingFinishPayload.homeScore ?? 0} -{" "}
                {pendingFinishPayload.awayScore ?? 0}{" "}
                {getTeamName(selectedMatch.awayTeamId)}
              </strong>
              ? El estado cambiará a <strong>FINISHED</strong> y se enviará el
              resumen por correo a los aficionados con boleto o apuesta.
            </p>
          ) : null
        }
        confirmLabel="Finalizar partido"
        isLoading={finishingMatch}
        onConfirm={handleConfirmFinish}
        onCancel={() => setPendingFinishPayload(null)}
      />

      <ConfirmModal
        visible={Boolean(eventToDelete)}
        title="Eliminar anotación"
        message={
          eventToDelete ? (
            <p className="mb-0">
              ¿Deseas eliminar la anotación <strong>{eventToDelete.type}</strong>{" "}
              del minuto <strong>{eventToDelete.minute}&apos;</strong>? El
              partido y el jugador no se verán afectados.
            </p>
          ) : null
        }
        confirmLabel="Eliminar"
        isLoading={deletingEvent}
        onConfirm={handleConfirmDeleteEvent}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
}
