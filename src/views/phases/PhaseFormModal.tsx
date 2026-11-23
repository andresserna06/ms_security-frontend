import React, { useEffect, useState } from "react";
import { FINAL_ROUND_OPTIONS, FinalRound, Phase } from "../../models/Phase";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

export interface FinalPhaseFormValues {
  order: number;
  finalRound: FinalRound;
}

interface PhaseFormModalProps {
  visible: boolean;
  phase: Phase | null;
  selectedTournamentId: string;
  suggestedOrder: number;
  submitting: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: FinalPhaseFormValues) => Promise<void>;
}

export default function PhaseFormModal({
  visible,
  phase,
  selectedTournamentId,
  suggestedOrder,
  submitting,
  error,
  fieldErrors = {},
  onClose,
  onSubmit,
}: PhaseFormModalProps) {
  const [order, setOrder] = useState<string>("1");
  const [finalRound, setFinalRound] = useState<string>("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    setOrder(String(phase?.order ?? suggestedOrder));
    setFinalRound(phase?.finalRound ?? "");
    setLocalErrors({});
  }, [visible, phase, suggestedOrder]);

  const validate = (): FinalPhaseFormValues | null => {
    const errors: Record<string, string> = {};
    if (!phase && !selectedTournamentId) {
      errors.tournamentId = "Debes seleccionar un torneo.";
    }

    const parsedOrder = Number(order);
    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      errors.order = "El orden debe ser un entero mayor o igual a 1.";
    }

    if (!finalRound) {
      errors.finalRound = "Debes seleccionar una ronda.";
    }

    setLocalErrors(errors);
    if (Object.keys(errors).length > 0) return null;

    return {
      order: parsedOrder,
      finalRound: finalRound as FinalRound,
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = validate();
    if (!values) return;
    await onSubmit(values);
  };

  const mergedErrors = { ...fieldErrors, ...localErrors };
  const isEdit = Boolean(phase);

  return (
    <GenericModal
      visible={visible}
      title={isEdit ? "Editar fase final" : "Crear fase final"}
      onClose={submitting ? () => {} : onClose}
      backdrop={submitting ? "static" : true}
      footer={
        <>
          <GenericButton
            label="Cancelar"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          />
          <button
            type="submit"
            form="final-phase-form"
            className="btn btn-sports-primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear fase final"}
          </button>
        </>
      }
    >
      <form id="final-phase-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert type="danger" message={error} onClose={() => {}} /> : null}
        {mergedErrors.tournamentId ? (
          <Alert type="danger" message={mergedErrors.tournamentId} onClose={() => {}} />
        ) : null}

        <div className="mb-3">
          <label htmlFor="final-phase-round" className="form-label">
            Ronda <span className="text-danger">*</span>
          </label>
          <select
            id="final-phase-round"
            className={`form-select ${mergedErrors.finalRound ? "is-invalid" : ""}`}
            value={finalRound}
            onChange={(e) => setFinalRound(e.target.value)}
            disabled={submitting}
          >
            <option value="">Seleccione una ronda</option>
            {FINAL_ROUND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {mergedErrors.finalRound ? (
            <div className="invalid-feedback">{mergedErrors.finalRound}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label htmlFor="final-phase-order" className="form-label">
            Orden <span className="text-danger">*</span>
          </label>
          <input
            id="final-phase-order"
            type="number"
            min={1}
            className={`form-control ${mergedErrors.order ? "is-invalid" : ""}`}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            disabled={submitting}
          />
          {mergedErrors.order ? (
            <div className="invalid-feedback">{mergedErrors.order}</div>
          ) : (
            <div className="form-text">
              {phase ? "Ajusta el orden si es necesario." : `Sugerido: ${suggestedOrder}. Mayor a 2.`}
            </div>
          )}
        </div>
      </form>
    </GenericModal>
  );
}
