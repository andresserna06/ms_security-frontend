import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FinalRound,
  GroupTeam,
  Phase,
  PhaseType,
  getFinalRoundLabel,
} from "../../models/Phase";
import { Tournament } from "../../models/Tournament";
import { serviceContainer } from "../../services/serviceContainer";
import { SportsApiError } from "../../services/sportsHttp";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import PhaseFilters from "./PhaseFilters";
import PhasesTable from "./PhasesTable";
import PhaseFormModal, { PhaseFormValues } from "./PhaseFormModal";
import GroupTeamsModal from "./GroupTeamsModal";

function getErrorFieldErrors(err: unknown): Record<string, string> {
  if (err && typeof err === "object" && "fieldErrors" in err) {
    const value = (err as { fieldErrors?: unknown }).fieldErrors;
    if (value && typeof value === "object") {
      return value as Record<string, string>;
    }
  }
  return {};
}

export default function PhasesPage() {
  const { tournamentService, phaseService, groupService, finalPhaseService } =
    serviceContainer;

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | PhaseType>("ALL");

  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);
  const [loadingPhases, setLoadingPhases] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [removing, setRemoving] = useState<boolean>(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null);

  const [groupTeamsPhase, setGroupTeamsPhase] = useState<Phase | null>(null);
  const [groupTeams, setGroupTeams] = useState<GroupTeam[]>([]);
  const [assignableTeams, setAssignableTeams] = useState<GroupTeam[]>([]);
  const [loadingGroupTeams, setLoadingGroupTeams] = useState<boolean>(false);
  const [groupTeamsError, setGroupTeamsError] = useState<string | null>(null);
  const [groupTeamsSubmitting, setGroupTeamsSubmitting] = useState<boolean>(false);

  const selectedTournament = useMemo(
    () =>
      tournaments.find((t) => String(t.id) === selectedTournamentId) ?? null,
    [tournaments, selectedTournamentId],
  );

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setPageError(null);
    try {
      const data = await tournamentService.getAll();
      setTournaments(data);
      if (!selectedTournamentId && data.length > 0) {
        setSelectedTournamentId(String(data[0].id));
      }
    } catch (err: any) {
      setPageError(err?.message || "No fue posible cargar los torneos.");
    } finally {
      setLoadingCatalogs(false);
    }
  }, [tournamentService, selectedTournamentId]);

  const loadPhases = useCallback(
    async (tournamentId: string) => {
      if (!tournamentId) {
        setPhases([]);
        setTableError(undefined);
        return;
      }
      setLoadingPhases(true);
      setTableError(undefined);
      try {
        const data = await phaseService.getAll(Number(tournamentId));
        setPhases(data);
      } catch (err: any) {
        setPhases(null);
        setTableError(err?.message || "No fue posible obtener las fases.");
      } finally {
        setLoadingPhases(false);
      }
    },
    [phaseService],
  );

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadPhases(selectedTournamentId);
  }, [loadPhases, selectedTournamentId]);

  const filteredPhases = useMemo(() => {
    if (!phases) return null;
    const query = searchTerm.trim().toLowerCase();
    return [...phases]
      .filter((phase) => (typeFilter === "ALL" ? true : phase.phaseType === typeFilter))
      .filter((phase) => {
        if (!query) return true;
        const roundLabel = getFinalRoundLabel(phase.finalRound).toLowerCase();
        return (
          phase.name.toLowerCase().includes(query) ||
          String(phase.order).includes(query) ||
          roundLabel.includes(query)
        );
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [phases, searchTerm, typeFilter]);

  const openCreate = () => {
    setEditingPhase(null);
    setFormError(null);
    setFormFieldErrors({});
    setShowForm(true);
  };

  const openEdit = (phase: Phase) => {
    setEditingPhase(phase);
    setFormError(null);
    setFormFieldErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (values: PhaseFormValues) => {
    setSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});
    setSuccess(null);
    try {
      if (values.phaseType === "GROUP") {
        if (editingPhase) {
          await groupService.update(editingPhase.id, {
            name: values.name,
            order: values.order,
          });
          setSuccess("Grupo actualizado correctamente.");
        } else {
          await groupService.create({
            name: values.name,
            order: values.order,
            tournamentId: Number(selectedTournamentId),
          });
          setSuccess("Grupo creado correctamente.");
        }
      } else {
        if (editingPhase && !values.finalRound) {
          setFormFieldErrors({ finalRound: "Debes seleccionar una ronda." });
          setFormError("Debes seleccionar una ronda para la fase final.");
          return;
        }
        const finalRound = values.finalRound as FinalRound;
        if (editingPhase) {
          await finalPhaseService.update(editingPhase.id, {
            name: values.name,
            order: values.order,
            finalRound,
          });
          setSuccess("Fase final actualizada correctamente.");
        } else {
          await finalPhaseService.create({
            name: values.name,
            order: values.order,
            tournamentId: Number(selectedTournamentId),
            finalRound,
          });
          setSuccess("Fase final creada correctamente.");
        }
      }
      setShowForm(false);
      setEditingPhase(null);
      await loadPhases(selectedTournamentId);
    } catch (err: any) {
      setFormError(err?.message || "No fue posible guardar la fase.");
      setFormFieldErrors(getErrorFieldErrors(err));
      if (err instanceof SportsApiError && err.status === 409) {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!phaseToDelete) return;
    setRemoving(true);
    setPageError(null);
    setSuccess(null);
    try {
      if (phaseToDelete.phaseType === "GROUP") {
        await groupService.remove(phaseToDelete.id);
      } else {
        await finalPhaseService.remove(phaseToDelete.id);
      }
      setSuccess("Fase eliminada correctamente.");
      setPhaseToDelete(null);
      await loadPhases(selectedTournamentId);
    } catch (err: any) {
      setPageError(err?.message || "No fue posible eliminar la fase.");
      setPhaseToDelete(null);
    } finally {
      setRemoving(false);
    }
  };

  const loadGroupTeams = useCallback(
    async (phase: Phase) => {
      if (!selectedTournamentId) return;
      setLoadingGroupTeams(true);
      setGroupTeamsError(null);
      try {
        const [teams, assignable] = await Promise.all([
          groupService.getTeams(phase.id),
          groupService.getAssignableTeams(Number(selectedTournamentId), phase.id),
        ]);
        setGroupTeams(teams);
        setAssignableTeams(assignable);
      } catch (err: any) {
        setGroupTeams([]);
        setAssignableTeams([]);
        setGroupTeamsError(err?.message || "No fue posible cargar los equipos del grupo.");
      } finally {
        setLoadingGroupTeams(false);
      }
    },
    [groupService, selectedTournamentId],
  );

  const openGroupTeams = async (phase: Phase) => {
    setGroupTeamsPhase(phase);
    await loadGroupTeams(phase);
  };

  const handleAssignTeam = async (teamId: number) => {
    if (!groupTeamsPhase) return;
    setGroupTeamsSubmitting(true);
    setGroupTeamsError(null);
    try {
      await groupService.assignTeam(groupTeamsPhase.id, teamId);
      await loadGroupTeams(groupTeamsPhase);
      await loadPhases(selectedTournamentId);
    } catch (err: any) {
      setGroupTeamsError(err?.message || "No fue posible asignar el equipo.");
    } finally {
      setGroupTeamsSubmitting(false);
    }
  };

  const handleRemoveTeam = async (teamId: number) => {
    if (!groupTeamsPhase) return;
    setGroupTeamsSubmitting(true);
    setGroupTeamsError(null);
    try {
      await groupService.removeTeam(groupTeamsPhase.id, teamId);
      await loadGroupTeams(groupTeamsPhase);
      await loadPhases(selectedTournamentId);
    } catch (err: any) {
      setGroupTeamsError(err?.message || "No fue posible quitar el equipo del grupo.");
    } finally {
      setGroupTeamsSubmitting(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando fases..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Fases</h2>
        </div>
        <button
          type="button"
          className="btn btn-sports-primary"
          onClick={openCreate}
          disabled={!selectedTournamentId}
        >
          Crear fase
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
          <PhaseFilters
            tournaments={tournaments}
            selectedTournamentId={selectedTournamentId}
            searchTerm={searchTerm}
            typeFilter={typeFilter}
            onTournamentChange={(value) => {
              setSelectedTournamentId(value);
              setSuccess(null);
            }}
            onSearchChange={setSearchTerm}
            onTypeFilterChange={setTypeFilter}
          />

          {selectedTournament ? (
            <div className="text-body-secondary small mb-3">
              Torneo seleccionado: <strong>{selectedTournament.name}</strong>
            </div>
          ) : null}

          <PhasesTable
            phases={filteredPhases}
            isLoading={loadingPhases}
            errorMessage={tableError}
            onEdit={openEdit}
            onDelete={(phase) => setPhaseToDelete(phase)}
            onManageTeams={openGroupTeams}
          />
        </div>
      </div>

      <PhaseFormModal
        visible={showForm}
        phase={editingPhase}
        selectedTournamentId={selectedTournamentId}
        submitting={submitting}
        error={formError}
        fieldErrors={formFieldErrors}
        onClose={() => {
          if (!submitting) setShowForm(false);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        visible={Boolean(phaseToDelete)}
        title="Eliminar fase"
        message={
          <p className="mb-0">
            ¿Desea eliminar la fase "{phaseToDelete?.name ?? ""}"?
          </p>
        }
        confirmLabel="Eliminar"
        isLoading={removing}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!removing) setPhaseToDelete(null);
        }}
      />

      <GroupTeamsModal
        visible={Boolean(groupTeamsPhase)}
        phase={groupTeamsPhase}
        teams={groupTeams}
        assignableTeams={assignableTeams}
        loading={loadingGroupTeams}
        submitting={groupTeamsSubmitting}
        error={groupTeamsError}
        onClose={() => {
          if (!groupTeamsSubmitting) {
            setGroupTeamsPhase(null);
            setGroupTeamsError(null);
          }
        }}
        onAssign={handleAssignTeam}
        onRemove={handleRemoveTeam}
      />
    </div>
  );
}
