import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Phase, getFinalRoundLabel } from "../../models/Phase";
import { Tournament } from "../../models/Tournament";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loader from "../../components/common/Loader";
import PhaseFilters from "./PhaseFilters";
import PhasesTable from "./PhasesTable";
import PhaseFormModal, { FinalPhaseFormValues } from "./PhaseFormModal";

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
  const { tournamentService, finalPhaseService } = serviceContainer;

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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
        const data = await finalPhaseService.getByTournament(Number(tournamentId));
        setPhases(data);
      } catch (err: any) {
        setPhases(null);
        setTableError(err?.message || "No fue posible obtener las fases finales.");
      } finally {
        setLoadingPhases(false);
      }
    },
    [finalPhaseService],
  );

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadPhases(selectedTournamentId);
  }, [loadPhases, selectedTournamentId]);

  const suggestedOrder = useMemo(() => {
    const maxOrder = (phases ?? []).reduce(
      (max, phase) => Math.max(max, phase.order),
      0,
    );
    return maxOrder + 1;
  }, [phases]);

  const filteredPhases = useMemo(() => {
    if (!phases) return null;
    const query = searchTerm.trim().toLowerCase();
    return [...phases]
      .filter((phase) => {
        if (!query) return true;
        const roundLabel = getFinalRoundLabel(phase.finalRound).toLowerCase();
        return String(phase.order).includes(query) || roundLabel.includes(query);
      })
      .sort((a, b) => a.order - b.order);
  }, [phases, searchTerm]);

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

  const handleSubmit = async (values: FinalPhaseFormValues) => {
    setSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});
    setSuccess(null);
    try {
      if (editingPhase) {
        await finalPhaseService.update(editingPhase.id, {
          order: values.order,
          finalRound: values.finalRound,
        });
        setSuccess("Fase final actualizada correctamente.");
      } else {
        await finalPhaseService.create({
          order: values.order,
          tournamentId: Number(selectedTournamentId),
          finalRound: values.finalRound,
        });
        setSuccess("Fase final creada correctamente.");
      }
      setShowForm(false);
      setEditingPhase(null);
      await loadPhases(selectedTournamentId);
    } catch (err: any) {
      setFormError(err?.message || "No fue posible guardar la fase final.");
      setFormFieldErrors(getErrorFieldErrors(err));
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
      await finalPhaseService.remove(phaseToDelete.id);
      setSuccess("Fase final eliminada correctamente.");
      setPhaseToDelete(null);
      await loadPhases(selectedTournamentId);
    } catch (err: any) {
      setPageError(err?.message || "No fue posible eliminar la fase final.");
      setPhaseToDelete(null);
    } finally {
      setRemoving(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando fases finales..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Fase final</h2>
        </div>
        <button
          type="button"
          className="btn btn-sports-primary"
          onClick={openCreate}
          disabled={!selectedTournamentId}
        >
          Crear fase final
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

          <PhasesTable
            phases={filteredPhases}
            isLoading={loadingPhases}
            errorMessage={tableError}
            onEdit={openEdit}
            onDelete={(phase) => setPhaseToDelete(phase)}
          />
        </div>
      </div>

      <PhaseFormModal
        visible={showForm}
        phase={editingPhase}
        selectedTournamentId={selectedTournamentId}
        suggestedOrder={suggestedOrder}
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
        title="Eliminar fase final"
        message={
          <p className="mb-0">
            ¿Desea eliminar la fase final "{phaseToDelete?.name ?? ""}"?
          </p>
        }
        confirmLabel="Eliminar"
        isLoading={removing}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!removing) setPhaseToDelete(null);
        }}
      />
    </div>
  );
}
