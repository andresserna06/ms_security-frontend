import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilReload } from "@coreui/icons";
import { Team, TeamPayload } from "../../models/Team";
import { TeamSportSummary } from "../../models/TeamSport";
import { ITeamService } from "../../services/interfaces/ITeamService";
import { ITeamSportService } from "../../services/interfaces/ITeamSportService";
import { serviceContainer } from "../../services/serviceContainer";
import { SportsApiError } from "../../services/sportsHttp";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import TeamsTable from "./TeamsTable";
import TeamFormModal from "./TeamFormModal";
import TeamDetailCard from "./TeamDetailCard";

type StatusFilter = "ACTIVE" | "INACTIVE" | "ALL";

export interface TeamsPageProps {
  teamService?: ITeamService;
  teamSportService?: ITeamSportService;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export default function TeamsPage({
  teamService = serviceContainer.teamService,
  teamSportService = serviceContainer.teamSportService,
}: TeamsPageProps) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const hasLoadedTeamsRef = useRef<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<Team | null>(null);
  const [selectedTeamSports, setSelectedTeamSports] = useState<TeamSportSummary[]>([]);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchAllTeamsIndex = useCallback(async () => {
    try {
      setAllTeams(await teamService.getAll());
    } catch {
      // El error principal se reporta en fetchTeams
    }
  }, [teamService]);

  const fetchTeams = useCallback(
    async (showSpinner = false) => {
      if (showSpinner && !hasLoadedTeamsRef.current) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);

      const active =
        statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE";

      try {
        const result = await teamService.getAll(active);
        hasLoadedTeamsRef.current = true;
        setTeams(result);
      } catch (err: any) {
        setError(err?.message || "No fue posible obtener la lista de equipos.");
        if (!hasLoadedTeamsRef.current) {
          setTeams(null);
        }
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [teamService, statusFilter],
  );

  // The name and city search is done on the loaded list (GET /teams only
  // filters by status).
  const filteredTeams = useMemo(() => {
    if (!teams) return null;
    const name = normalize(nameFilter);
    const city = normalize(cityFilter);
    return teams.filter(
      (team) =>
        (!name || normalize(team.name).includes(name)) &&
        (!city || normalize(team.city).includes(city)),
    );
  }, [teams, nameFilter, cityFilter]);

  useEffect(() => {
    if (!filteredTeams) return;
    setSelectedTeamId((currentId) => {
      if (currentId && filteredTeams.some((t) => t.id === currentId)) {
        return currentId;
      }
      return filteredTeams.length > 0 ? filteredTeams[0].id : null;
    });
  }, [filteredTeams]);

  const fetchTeamDetail = useCallback(
    async (teamId: number | null) => {
      if (!teamId) {
        setSelectedTeamDetail(null);
        setSelectedTeamSports([]);
        return;
      }

      setLoadingDetail(true);
      try {
        const [detail, sports] = await Promise.all([
          teamService.getById(teamId),
          teamSportService.getSportsOfTeam(teamId),
        ]);
        setSelectedTeamDetail(detail);
        setSelectedTeamSports(sports);
      } catch (err: any) {
        setError(err?.message || "No fue posible consultar el detalle del equipo.");
      } finally {
        setLoadingDetail(false);
      }
    },
    [teamService, teamSportService],
  );

  useEffect(() => {
    fetchAllTeamsIndex();
  }, [fetchAllTeamsIndex]);

  useEffect(() => {
    fetchTeams(true);
  }, [fetchTeams]);

  useEffect(() => {
    fetchTeamDetail(selectedTeamId);
  }, [selectedTeamId, fetchTeamDetail]);

  const handleClearFilters = () => {
    setStatusFilter("ACTIVE");
    setNameFilter("");
    setCityFilter("");
  };

  const handleOpenCreate = () => {
    setTeamToEdit(null);
    setFormModalVisible(true);
    setSuccess(null);
  };

  const handleOpenEdit = (team: Team) => {
    setTeamToEdit(team);
    setFormModalVisible(true);
    setSuccess(null);
  };

  const refreshLists = () => Promise.all([fetchTeams(false), fetchAllTeamsIndex()]);

  const handleFormSubmit = async (payload: TeamPayload) => {
    setSubmittingForm(true);
    try {
      if (teamToEdit) {
        const updated = await teamService.update(teamToEdit.id, payload);
        setSuccess(`Equipo "${updated.name}" actualizado correctamente.`);
        setSelectedTeamId(updated.id);
      } else {
        const created = await teamService.create(payload);
        setSuccess(`Equipo "${created.name}" registrado correctamente.`);
        setSelectedTeamId(created.id);
      }
      setFormModalVisible(false);
      setTeamToEdit(null);
      await refreshLists();
      if (teamToEdit) {
        await fetchTeamDetail(teamToEdit.id);
      }
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (team: Team) => {
    setError(null);
    setSuccess(null);
    try {
      if (team.active) {
        await teamService.deactivate(team.id);
        setSuccess(`Equipo "${team.name}" desactivado correctamente.`);
      } else {
        await teamService.activate(team.id);
        setSuccess(`Equipo "${team.name}" activado correctamente.`);
      }
      await refreshLists();
      if (selectedTeamId === team.id) {
        await fetchTeamDetail(team.id);
      }
    } catch (err: any) {
      setError(err?.message || "No fue posible cambiar el estado del equipo.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await teamService.remove(teamToDelete.id);
      setSuccess(`Equipo "${teamToDelete.name}" eliminado correctamente.`);
      const deletedId = teamToDelete.id;
      setTeamToDelete(null);
      if (selectedTeamId === deletedId) {
        setSelectedTeamId(null);
      }
      await refreshLists();
    } catch (err: any) {
      setTeamToDelete(null);
      if (err instanceof SportsApiError && err.status === 409) {
        // ms_sports already explains what blocks the delete and suggests deactivating.
        setError(err.message);
      } else {
        setError(err?.message || "No fue posible eliminar el equipo.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = useMemo(
    () => allTeams.filter((t) => t.active).length,
    [allTeams],
  );
  const inactiveCount = allTeams.length - activeCount;

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Gestión de Equipos</h2>
        </div>
        <button
          type="button"
          className="btn btn-sports-primary d-inline-flex align-items-center gap-2"
          onClick={handleOpenCreate}
        >
          <CIcon icon={cilPlus} size="sm" />
          <span>Nuevo equipo</span>
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
              <span className="fs-5 fw-bold">{allTeams.length}</span>
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
              <span className="text-body-secondary small">Inactivos</span>
              <span className="fs-5 fw-bold text-secondary">{inactiveCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label htmlFor="teams-status-filter" className="form-label small mb-1">
                Estado
              </label>
              <select
                id="teams-status-filter"
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
              <label htmlFor="teams-name-filter" className="form-label small mb-1">
                Nombre
              </label>
              <input
                id="teams-name-filter"
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="teams-city-filter" className="form-label small mb-1">
                Ciudad
              </label>
              <input
                id="teams-city-filter"
                type="text"
                className="form-control"
                placeholder="Buscar por ciudad..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
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
                <span className="fw-semibold">Listado de equipos</span>
                {isFiltering ? (
                  <div
                    className="spinner-border spinner-border-sm text-success"
                    role="status"
                    aria-label="Actualizando resultados"
                  />
                ) : null}
              </div>
              <span className="badge rounded-pill badge-sports">
                {filteredTeams ? filteredTeams.length : 0} resultado(s)
              </span>
            </div>
            <div className="card-body">
              <TeamsTable
                teams={filteredTeams}
                isLoading={isLoading}
                errorMessage={error || undefined}
                selectedTeamId={selectedTeamId}
                onSelect={(team) => setSelectedTeamId(team.id)}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={(team) => setTeamToDelete(team)}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <TeamDetailCard
            teamDetail={selectedTeamDetail}
            teamSports={selectedTeamSports}
            loadingDetail={loadingDetail}
            onEditTeam={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onDeleteTeam={(team) => setTeamToDelete(team)}
          />
        </div>
      </div>

      <TeamFormModal
        visible={formModalVisible}
        teamToEdit={teamToEdit}
        submitting={submittingForm}
        onClose={() => {
          setFormModalVisible(false);
          setTeamToEdit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        visible={Boolean(teamToDelete)}
        title="Eliminar equipo"
        message={
          teamToDelete ? (
            <p className="mb-0">
              ¿Estás seguro de eliminar el equipo{" "}
              <strong>{teamToDelete.name}</strong>? Esta acción no se puede deshacer.
            </p>
          ) : null
        }
        confirmLabel="Eliminar"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTeamToDelete(null)}
      />
    </div>
  );
}
