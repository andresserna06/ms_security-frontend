import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilReload } from "@coreui/icons";
import { Tournament } from "../../models/Tournament";
import { TournamentOverview } from "../../models/TournamentOverview";
import { ITournamentService } from "../../services/interfaces/ITournamentService";
import { ITeamService } from "../../services/interfaces/ITeamService";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import { formatDate } from "../../utils/tournamentDates";
import OverviewPhaseCard from "./OverviewPhaseCard";
import BracketCard from "./BracketCard";

export interface TournamentOverviewPageProps {
  tournamentService?: ITournamentService;
  teamService?: ITeamService;
}

export default function TournamentOverviewPage({
  tournamentService = serviceContainer.tournamentService,
  teamService = serviceContainer.teamService,
}: TournamentOverviewPageProps) {
  const { id: routeIdParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);

  const [overview, setOverview] = useState<TournamentOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logos, setLogos] = useState<Map<number, string | null | undefined>>(new Map());

  // Crests are read once from the teams list instead of repeating them in every match.
  useEffect(() => {
    let active = true;
    teamService
      .getAll()
      .then((teams) => {
        if (active) setLogos(new Map(teams.map((team) => [team.id, team.logo])));
      })
      .catch(() => {
        // Without crests the overview still works: the initials are shown.
      });
    return () => {
      active = false;
    };
  }, [teamService]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingList(true);
      try {
        // Inactive tournaments stay visible: their development is history.
        const result = await tournamentService.getAll();
        if (!active) return;
        setTournaments(result);
        const parsed = Number(routeIdParam);
        const fromRoute =
          Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        setSelectedTournamentId(
          fromRoute ?? (result.length > 0 ? result[0].id : null),
        );
      } catch (err: any) {
        if (active) {
          setError(err?.message || "No fue posible obtener la lista de torneos.");
        }
      } finally {
        if (active) setLoadingList(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tournamentService, routeIdParam]);

  const fetchOverview = useCallback(
    async (tournamentId: number | null) => {
      if (!tournamentId) {
        setOverview(null);
        return;
      }
      setLoadingOverview(true);
      setError(null);
      try {
        setOverview(await tournamentService.getOverview(tournamentId));
      } catch (err: any) {
        setOverview(null);
        setError(err?.message || "No fue posible consultar el desarrollo del torneo.");
      } finally {
        setLoadingOverview(false);
      }
    },
    [tournamentService],
  );

  useEffect(() => {
    fetchOverview(selectedTournamentId);
  }, [selectedTournamentId, fetchOverview]);

  const handleSelectTournament = (tournamentId: number | null) => {
    setSelectedTournamentId(tournamentId);
    if (routeIdParam && tournamentId) {
      navigate(`/tournament-overview/${tournamentId}`, { replace: true });
    }
  };

  const phases = overview?.phases ?? [];
  const knockoutPhases = useMemo(
    () => phases.filter((p) => p.type === "KNOCKOUT"),
    [phases],
  );
  const totalMatches = phases.reduce((sum, p) => sum + p.matches.length, 0);
  const matchesWithResult = phases.reduce(
    (sum, p) => sum + p.matches.filter((m) => m.hasResult).length,
    0,
  );

  if (loadingList) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando torneos..." />
      </div>
    );
  }

  const info = overview?.tournament;

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="mb-3">
        <h2 className="mb-0 fw-bold">Desarrollo del Torneo</h2>
      </div>

      {error ? (
        <Alert type="danger" message={error} onClose={() => setError(null)} />
      ) : null}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label htmlFor="overview-tournament-select" className="form-label small mb-1">
                Seleccionar torneo
              </label>
              <select
                id="overview-tournament-select"
                className="form-select"
                value={selectedTournamentId ?? ""}
                onChange={(e) =>
                  handleSelectTournament(e.target.value ? Number(e.target.value) : null)
                }
                disabled={tournaments.length === 0}
              >
                {tournaments.length === 0 ? (
                  <option value="">No hay torneos registrados</option>
                ) : null}
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                    {tournament.sportName ? ` - ${tournament.sportName}` : ""}
                    {tournament.active ? "" : " [Inactivo]"}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1 d-grid">
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                title="Actualizar"
                aria-label="Actualizar"
                onClick={() => fetchOverview(selectedTournamentId)}
                disabled={!selectedTournamentId}
              >
                <CIcon icon={cilReload} size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loadingOverview && !overview ? (
        <Loader text="Cargando desarrollo del torneo..." />
      ) : null}

      {info ? (
        <>
          <div className="card shadow-sm mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">Información general</span>
                {loadingOverview ? (
                  <div
                    className="spinner-border spinner-border-sm text-success"
                    role="status"
                    aria-label="Actualizando"
                  />
                ) : null}
              </div>
              <span
                className={`badge rounded-pill ${
                  info.active ? "badge-sports" : "bg-secondary"
                }`}
              >
                {info.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="card-body">
              <h5 className="fw-bold mb-3">{info.name}</h5>
              <div className="row g-3">
                <div className="col-sm-6 col-lg-3">
                  <div className="text-body-secondary small">Deporte</div>
                  <div className="fw-semibold">{info.sportName || "—"}</div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="text-body-secondary small">Cierre de inscripciones</div>
                  <div className="fw-semibold">{formatDate(info.enrollmentDeadline)}</div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="text-body-secondary small">Fecha de inicio</div>
                  <div className="fw-semibold">{formatDate(info.startDate)}</div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="text-body-secondary small">Partidos con resultado</div>
                  <div className="fw-semibold">
                    {matchesWithResult} de {totalMatches}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {phases.length === 0 ? (
            <Alert
              type="info"
              message={overview?.message || "El torneo aún no tiene fases configuradas"}
            />
          ) : (
            <>
              {knockoutPhases.length > 0 ? <BracketCard rounds={knockoutPhases} logos={logos} /> : null}
              {/* ms_sports already returns the phases in competition order. */}
              {phases.map((phase) => (
                <OverviewPhaseCard key={phase.id} phase={phase} logos={logos} />
              ))}
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
