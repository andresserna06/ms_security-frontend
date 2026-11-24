import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilReload } from "@coreui/icons";
import {
  Tournament,
  TournamentPayload,
  TournamentQueryFilters,
} from "../../models/Tournament";
import { Sport } from "../../models/Sport";
import { ITournamentService } from "../../services/interfaces/ITournamentService";
import { ISportService } from "../../services/interfaces/ISportService";
import { serviceContainer } from "../../services/serviceContainer";
import { SportsApiError } from "../../services/sportsHttp";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import { isEnrollmentOpen } from "../../utils/tournamentDates";
import TournamentsTable from "./TournamentsTable";
import TournamentFormModal from "./TournamentFormModal";
import TournamentDetailCard from "./TournamentDetailCard";

type StatusFilter = "ACTIVE" | "INACTIVE" | "ALL";

export interface TournamentsPageProps {
  tournamentService?: ITournamentService;
  sportService?: ISportService;
}

export default function TournamentsPage({
  tournamentService = serviceContainer.tournamentService,
  sportService = serviceContainer.sportService,
}: TournamentsPageProps) {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState<Tournament[] | null>(null);
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const hasLoadedRef = useRef<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [sportFilter, setSportFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [appliedName, setAppliedName] = useState<string>("");

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Tournament | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [tournamentToEdit, setTournamentToEdit] = useState<Tournament | null>(null);
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchSports = useCallback(async () => {
    setLoadingSports(true);
    try {
      setSports(await sportService.getAll({ all: true }));
    } catch (err: any) {
      setError(err?.message || "No fue posible obtener la lista de deportes.");
    } finally {
      setLoadingSports(false);
    }
  }, [sportService]);

  const fetchAllIndex = useCallback(async () => {
    try {
      setAllTournaments(await tournamentService.getAll());
    } catch {
      // El error principal se reporta en fetchTournaments
    }
  }, [tournamentService]);

  const fetchTournaments = useCallback(
    async (showSpinner = false) => {
      if (showSpinner && !hasLoadedRef.current) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);

      const filters: TournamentQueryFilters = {};
      if (statusFilter !== "ALL") {
        filters.active = statusFilter === "ACTIVE";
      }
      if (sportFilter) {
        filters.sportId = Number(sportFilter);
      }
      if (appliedName.trim()) {
        filters.name = appliedName.trim();
      }

      try {
        const result = await tournamentService.getAll(filters);
        hasLoadedRef.current = true;
        setTournaments(result);
        setSelectedTournamentId((currentId) => {
          if (currentId && result.some((t) => t.id === currentId)) {
            return currentId;
          }
          return result.length > 0 ? result[0].id : null;
        });
      } catch (err: any) {
        setError(err?.message || "No fue posible obtener la lista de torneos.");
        if (!hasLoadedRef.current) {
          setTournaments(null);
        }
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [tournamentService, statusFilter, sportFilter, appliedName],
  );

  const fetchDetail = useCallback(
    async (tournamentId: number | null) => {
      if (!tournamentId) {
        setSelectedDetail(null);
        return;
      }
      setLoadingDetail(true);
      try {
        setSelectedDetail(await tournamentService.getById(tournamentId));
      } catch (err: any) {
        setError(err?.message || "No fue posible consultar el detalle del torneo.");
      } finally {
        setLoadingDetail(false);
      }
    },
    [tournamentService],
  );

  useEffect(() => {
    fetchSports();
    fetchAllIndex();
  }, [fetchSports, fetchAllIndex]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedName(nameFilter), 250);
    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  useEffect(() => {
    fetchTournaments(true);
  }, [fetchTournaments]);

  useEffect(() => {
    fetchDetail(selectedTournamentId);
  }, [selectedTournamentId, fetchDetail]);

  const handleClearFilters = () => {
    setStatusFilter("ACTIVE");
    setSportFilter("");
    setNameFilter("");
    setAppliedName("");
  };

  const handleOpenCreate = () => {
    setTournamentToEdit(null);
    setFormModalVisible(true);
    setSuccess(null);
  };

  const handleOpenEdit = (tournament: Tournament) => {
    setTournamentToEdit(tournament);
    setFormModalVisible(true);
    setSuccess(null);
  };

  const refreshLists = () => Promise.all([fetchTournaments(false), fetchAllIndex()]);

  const handleFormSubmit = async (payload: TournamentPayload) => {
    setSubmittingForm(true);
    try {
      if (tournamentToEdit) {
        const updated = await tournamentService.update(tournamentToEdit.id, payload);
        setSuccess(`Torneo "${updated.name}" actualizado correctamente.`);
        setSelectedTournamentId(updated.id);
      } else {
        const created = await tournamentService.create(payload);
        setSuccess(`Torneo "${created.name}" registrado correctamente.`);
        setSelectedTournamentId(created.id);
      }
      setFormModalVisible(false);
      setTournamentToEdit(null);
      await refreshLists();
      if (tournamentToEdit) {
        await fetchDetail(tournamentToEdit.id);
      }
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (tournament: Tournament) => {
    setError(null);
    setSuccess(null);
    try {
      if (tournament.active) {
        await tournamentService.deactivate(tournament.id);
        setSuccess(`Torneo "${tournament.name}" desactivado correctamente.`);
      } else {
        await tournamentService.activate(tournament.id);
        setSuccess(`Torneo "${tournament.name}" activado correctamente.`);
      }
      await refreshLists();
      if (selectedTournamentId === tournament.id) {
        await fetchDetail(tournament.id);
      }
    } catch (err: any) {
      setError(err?.message || "No fue posible cambiar el estado del torneo.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!tournamentToDelete) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await tournamentService.remove(tournamentToDelete.id);
      setSuccess(`Torneo "${tournamentToDelete.name}" eliminado correctamente.`);
      const deletedId = tournamentToDelete.id;
      setTournamentToDelete(null);
      if (selectedTournamentId === deletedId) {
        setSelectedTournamentId(null);
      }
      await refreshLists();
    } catch (err: any) {
      setTournamentToDelete(null);
      if (err instanceof SportsApiError && err.status === 409) {
        // ms_sports already explains what blocks the delete and suggests deactivating.
        setError(err.message);
      } else {
        setError(err?.message || "No fue posible eliminar el torneo.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = useMemo(
    () => allTournaments.filter((t) => t.active).length,
    [allTournaments],
  );
  const openEnrollmentCount = useMemo(
    () =>
      allTournaments.filter((t) => isEnrollmentOpen(t.enrollmentDeadline, t.active))
        .length,
    [allTournaments],
  );

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Gestión de Torneos</h2>
        </div>
        <button
          type="button"
          className="btn btn-sports-primary d-inline-flex align-items-center gap-2"
          onClick={handleOpenCreate}
        >
          <CIcon icon={cilPlus} size="sm" />
          <span>Nuevo torneo</span>
        </button>
      </div>

      {error ? (
        <Alert type="danger" message={error} onClose={() => setError(null)} />
      ) : null}
      {success ? (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      ) : null}

      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <div className="card shadow-sm border-0">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">Total registrados</span>
              <span className="fs-5 fw-bold">{allTournaments.length}</span>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card shadow-sm border-0">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">Activos</span>
              <span className="fs-5 fw-bold text-success">{activeCount}</span>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card shadow-sm border-0">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">Inscripciones abiertas</span>
              <span className="fs-5 fw-bold text-info">{openEnrollmentCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label htmlFor="tournaments-status-filter" className="form-label small mb-1">
                Estado
              </label>
              <select
                id="tournaments-status-filter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="ACTIVE">Solo activos</option>
                <option value="INACTIVE">Solo inactivos</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="tournaments-sport-filter" className="form-label small mb-1">
                Deporte
              </label>
              <select
                id="tournaments-sport-filter"
                className="form-select"
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                disabled={loadingSports}
              >
                <option value="">Todos los deportes</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.parentSport
                      ? `${sport.name} (${sport.parentSport.name})`
                      : sport.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="tournaments-name-filter" className="form-label small mb-1">
                Nombre
              </label>
              <input
                id="tournaments-name-filter"
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            <div className="col-md-1 d-grid">
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                title="Limpiar filtros"
                aria-label="Limpiar filtros"
                onClick={handleClearFilters}
              >
                <CIcon icon={cilReload} size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">Listado de torneos</span>
                {isFiltering ? (
                  <div
                    className="spinner-border spinner-border-sm text-success"
                    role="status"
                    aria-label="Actualizando resultados"
                  />
                ) : null}
              </div>
              <span className="badge rounded-pill badge-sports">
                {tournaments ? tournaments.length : 0} resultado(s)
              </span>
            </div>
            <div className="card-body">
              <TournamentsTable
                tournaments={tournaments}
                isLoading={isLoading}
                errorMessage={error || undefined}
                selectedTournamentId={selectedTournamentId}
                onSelect={(tournament) => setSelectedTournamentId(tournament.id)}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={(tournament) => setTournamentToDelete(tournament)}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <TournamentDetailCard
            tournamentDetail={selectedDetail}
            loadingDetail={loadingDetail}
            onEditTournament={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onDeleteTournament={(tournament) => setTournamentToDelete(tournament)}
            onViewOverview={(tournament) =>
              navigate(`/tournament-overview/${tournament.id}`)
            }
          />
        </div>
      </div>

      <TournamentFormModal
        visible={formModalVisible}
        tournamentToEdit={tournamentToEdit}
        sports={sports}
        loadingSports={loadingSports}
        submitting={submittingForm}
        onClose={() => {
          setFormModalVisible(false);
          setTournamentToEdit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        visible={Boolean(tournamentToDelete)}
        title="Eliminar torneo"
        message={
          tournamentToDelete ? (
            <p className="mb-0">
              ¿Estás seguro de eliminar el torneo{" "}
              <strong>{tournamentToDelete.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
          ) : null
        }
        confirmLabel="Eliminar"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTournamentToDelete(null)}
      />
    </div>
  );
}
