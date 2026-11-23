import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Registration } from "../../models/Registration";
import { Team } from "../../models/Team";
import { Tournament } from "../../models/Tournament";
import { IRegistrationService } from "../../services/interfaces/IRegistrationService";
import { ITournamentService } from "../../services/interfaces/ITournamentService";
import { ITeamService } from "../../services/interfaces/ITeamService";
import { serviceContainer } from "../../services/serviceContainer";
import { SportsApiError } from "../../services/sportsHttp";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import RegistrationFilters from "./RegistrationFilters";
import RegistrationFormModal from "./RegistrationFormModal";
import RegistrationsTable from "./RegistrationsTable";

export interface RegistrationsPageProps {
  registrationService?: IRegistrationService;
  tournamentService?: ITournamentService;
  teamService?: ITeamService;
}

export default function RegistrationsPage({
  registrationService = serviceContainer.registrationService,
  tournamentService = serviceContainer.tournamentService,
  teamService = serviceContainer.teamService,
}: RegistrationsPageProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [registrationToWithdraw, setRegistrationToWithdraw] =
    useState<Registration | null>(null);
  const [registrationToConfirm, setRegistrationToConfirm] =
    useState<Registration | null>(null);

  const selectedTournament = useMemo(
    () =>
      tournaments.find(
        (tournament) => String(tournament.id) === selectedTournamentId,
      ) ?? null,
    [tournaments, selectedTournamentId],
  );

  const teamsById = useMemo(() => {
    const map = new Map<number, Team>();
    teams.forEach((team) => map.set(Number(team.id), team));
    return map;
  }, [teams]);

  const mergeRegistrations = useCallback(
    (incoming: Registration[], previous: Registration[] | null): Registration[] =>
      incoming.map((registration) => {
        const prev = (previous ?? []).find(
          (item) => item.teamId === registration.teamId,
        );
        if (!prev) return registration;
        return {
          ...prev,
          ...registration,
          id: registration.id ?? prev.id,
          registeredAt: registration.registeredAt ?? prev.registeredAt,
          withdrawnAt: registration.withdrawnAt ?? prev.withdrawnAt,
          status: registration.status ?? prev.status,
          teamName: registration.teamName ?? prev.teamName,
        };
      }),
    [],
  );

  const registrationsView = useMemo(() => {
    if (!registrations) return null;
    return registrations.map((registration) => {
      const team = teamsById.get(Number(registration.teamId));
      return {
        ...registration,
        teamName:
          registration.teamName ||
          team?.name ||
          (registration.teamId ? `Equipo #${registration.teamId}` : "Equipo desconocido"),
      };
    });
  }, [registrations, teamsById]);

  const filteredRegistrations = useMemo(() => {
    if (!registrationsView) return null;
    const query = searchTerm.trim().toLowerCase();
    if (!query) return registrationsView;
    return registrationsView.filter((registration) => {
      const teamName = (registration.teamName ?? "").toLowerCase();
      const teamId = String(registration.teamId ?? "");
      const registrationId = String(registration.id ?? "");
      return (
        teamName.includes(query) ||
        teamId.includes(query) ||
        registrationId.includes(query)
      );
    });
  }, [registrationsView, searchTerm]);

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setPageError(null);
    try {
      const [tournamentsResult, teamsResult] = await Promise.allSettled([
        tournamentService.getAll(),
        teamService.getAll(),
      ]);

      if (tournamentsResult.status === "fulfilled") {
        setTournaments(tournamentsResult.value);
        if (!selectedTournamentId && tournamentsResult.value.length > 0) {
          setSelectedTournamentId(String(tournamentsResult.value[0].id));
        }
      } else {
        setTournaments([]);
        setPageError(
          tournamentsResult.reason?.message ||
            "No fue posible cargar los torneos.",
        );
      }

      if (teamsResult.status === "fulfilled") {
        setTeams(teamsResult.value);
      } else {
        setTeams([]);
        setPageError((prev) =>
          prev
            ? prev
            : teamsResult.reason?.message || "No fue posible cargar los equipos.",
        );
      }
    } finally {
      setLoadingCatalogs(false);
    }
  }, [teamService, tournamentService, selectedTournamentId]);

  const loadRegistrations = useCallback(
    async (tournamentId: string) => {
      if (!tournamentId) {
        setRegistrations([]);
        setTableError(undefined);
        return;
      }

      setLoadingRegistrations(true);
      setTableError(undefined);
      try {
        const data = await registrationService.getByTournament(Number(tournamentId));
        setRegistrations((prev) => mergeRegistrations(data, prev));
      } catch (err: any) {
        setRegistrations(null);
        setTableError(
          err?.message || "No fue posible obtener las inscripciones del torneo.",
        );
      } finally {
        setLoadingRegistrations(false);
      }
    },
    [registrationService, mergeRegistrations],
  );

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadRegistrations(selectedTournamentId);
  }, [loadRegistrations, selectedTournamentId]);

  const handleCreate = async (teamId: number) => {
    if (!selectedTournamentId) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    setSuccess(null);
    try {
      const created = await registrationService.create(Number(selectedTournamentId), {
        teamId,
      });
      setRegistrations((prev) => {
        const next = prev ? [...prev] : [];
        const index = next.findIndex((item) => item.teamId === created.teamId);
        if (index >= 0) {
          next[index] = { ...next[index], ...created };
          return next;
        }
        return [...next, created];
      });
      setShowForm(false);
      setSuccess("Equipo inscrito correctamente.");
      await loadRegistrations(selectedTournamentId);
    } catch (err: any) {
      setFormError(err?.message || "No fue posible inscribir el equipo.");
      if (err instanceof SportsApiError && err.status === 400 && err.errorCase) {
        setFieldErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!registrationToWithdraw || !selectedTournamentId) return;
    if (
      !Number.isInteger(registrationToWithdraw.teamId) ||
      registrationToWithdraw.teamId < 1
    ) {
      setPageError("No se pudo identificar el equipo de la inscripción.");
      setRegistrationToWithdraw(null);
      return;
    }
    setWithdrawing(true);
    setPageError(null);
    setSuccess(null);
    try {
      const updated = await registrationService.withdraw(
        Number(selectedTournamentId),
        registrationToWithdraw.teamId,
      );
      if (updated) {
        setRegistrations((prev) =>
          (prev ?? []).map((item) =>
            item.teamId === updated.teamId ? { ...item, ...updated } : item,
          ),
        );
      } else {
        setRegistrations((prev) =>
          (prev ?? []).map((item) =>
            item.teamId === registrationToWithdraw.teamId
              ? { ...item, status: "WITHDRAWN" }
              : item,
          ),
        );
      }
      setRegistrationToWithdraw(null);
      setSuccess("Inscripción retirada correctamente.");
      await loadRegistrations(selectedTournamentId);
    } catch (err: any) {
      setRegistrationToWithdraw(null);
      setPageError(err?.message || "No fue posible retirar la inscripción.");
      await loadRegistrations(selectedTournamentId);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!registrationToConfirm || !selectedTournamentId) return;
    if (
      !Number.isInteger(registrationToConfirm.teamId) ||
      registrationToConfirm.teamId < 1
    ) {
      setPageError("No se pudo identificar el equipo de la inscripción.");
      setRegistrationToConfirm(null);
      return;
    }
    setConfirming(true);
    setPageError(null);
    setSuccess(null);
    try {
      const updated = await registrationService.confirm(
        Number(selectedTournamentId),
        registrationToConfirm.teamId,
      );
      if (updated) {
        setRegistrations((prev) =>
          (prev ?? []).map((item) =>
            item.teamId === updated.teamId ? { ...item, ...updated } : item,
          ),
        );
      } else {
        setRegistrations((prev) =>
          (prev ?? []).map((item) =>
            item.teamId === registrationToConfirm.teamId
              ? { ...item, status: "CONFIRMED", withdrawnAt: null }
              : item,
          ),
        );
      }
      setRegistrationToConfirm(null);
      setSuccess("Inscripción reintegrada correctamente.");
      await loadRegistrations(selectedTournamentId);
    } catch (err: any) {
      setRegistrationToConfirm(null);
      setPageError(err?.message || "No fue posible reintegrar la inscripción.");
      await loadRegistrations(selectedTournamentId);
    } finally {
      setConfirming(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando inscripciones..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Inscripciones</h2>
        </div>
        <button
          type="button"
          className="btn btn-sports-primary"
          onClick={() => {
            setFormError(null);
            setFieldErrors({});
            setShowForm(true);
          }}
          disabled={!selectedTournamentId}
        >
          Inscribir equipo
        </button>
      </div>

      {pageError ? (
        <Alert type="danger" message={pageError} onClose={() => setPageError(null)} />
      ) : null}
      {success ? (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      ) : null}

      <div className="card shadow-sm">
        <div className="card-body">
          <RegistrationFilters
            tournaments={tournaments}
            selectedTournamentId={selectedTournamentId}
            searchTerm={searchTerm}
            isLoading={loadingCatalogs}
            onTournamentChange={(value) => {
              setSelectedTournamentId(value);
              setSuccess(null);
            }}
            onSearchChange={setSearchTerm}
          />

          {selectedTournament ? (
            <div className="text-body-secondary small mb-3">
              Torneo seleccionado: <strong>{selectedTournament.name}</strong>
            </div>
          ) : null}

          <RegistrationsTable
            registrations={filteredRegistrations}
            isLoading={loadingRegistrations}
            errorMessage={tableError}
            onWithdraw={(registration) => setRegistrationToWithdraw(registration)}
            onConfirm={(registration) => setRegistrationToConfirm(registration)}
          />
        </div>
      </div>

      <RegistrationFormModal
        visible={showForm}
        teams={teams}
        submitting={submitting}
        error={formError}
        fieldErrors={fieldErrors}
        onClose={() => {
          if (!submitting) setShowForm(false);
        }}
        onSubmit={handleCreate}
      />

      <ConfirmModal
        visible={Boolean(registrationToWithdraw)}
        title="Retirar inscripción"
        message={
          <p className="mb-0">
            ¿Retirar a este equipo
            {registrationToWithdraw?.teamName
              ? ` (${registrationToWithdraw.teamName})`
              : ""}
            ?
          </p>
        }
        confirmLabel="Retirar"
        isLoading={withdrawing}
        onConfirm={handleWithdraw}
        onCancel={() => {
          if (!withdrawing) setRegistrationToWithdraw(null);
        }}
      />

      <ConfirmModal
        visible={Boolean(registrationToConfirm)}
        title="Reintegrar inscripción"
        message={
          <p className="mb-0">
            ¿Reintegrar a este equipo
            {registrationToConfirm?.teamName
              ? ` (${registrationToConfirm.teamName})`
              : ""}
            ?
          </p>
        }
        confirmLabel="Reintegrar"
        isLoading={confirming}
        onConfirm={handleConfirmRegistration}
        onCancel={() => {
          if (!confirming) setRegistrationToConfirm(null);
        }}
      />
    </div>
  );
}
