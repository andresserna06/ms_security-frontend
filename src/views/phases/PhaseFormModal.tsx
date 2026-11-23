import React, { useEffect, useState } from "react";
import {
  FINAL_ROUND_OPTIONS,
  FinalRound,
  Phase,
  PhaseType,
  getFinalRoundLabel,
} from "../../models/Phase";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

export interface PhaseFormValues {
  phaseType: PhaseType;
  name: string;
  order: number;
  finalRound?: FinalRound;
}

interface PhaseFormModalProps {
  visible: boolean;
  phase: Phase | null;
  selectedTournamentId: string;
  submitting: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: PhaseFormValues) => Promise<void>;
}

export default function PhaseFormModal({
  visible,
  phase,
  selectedTournamentId,
  submitting,
  error,
  fieldErrors = {},
  onClose,
  onSubmit,
}: PhaseFormModalProps) {
  const [phaseType, setPhaseType] = useState<PhaseType>("GROUP");
  const [name, setName] = useState<string>("");
  const [order, setOrder] = useState<string>("1");
  const [finalRound, setFinalRound] = useState<string>("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    const nextType = phase?.phaseType ?? "GROUP";
    setPhaseType(nextType);
    setName(phase?.name ?? "");
    setOrder(String(phase?.order ?? 1));
    setFinalRound(phase?.finalRound ?? "");
    setLocalErrors({});
  }, [visible, phase]);

  const handlePhaseTypeChange = (value: PhaseType) => {
    setPhaseType(value);
    if (value === "FINAL") {
      const round = (finalRound as FinalRound) || undefined;
      setName(round ? getFinalRoundLabel(round) : "");
    } else if (phase?.phaseType !== "GROUP") {
      setName("");
    }
  };

  const handleFinalRoundChange = (value: string) => {
    setFinalRound(value);
    const round = value as FinalRound;
    setName(getFinalRoundLabel(round));
  };

  const validate = (): PhaseFormValues | null => {
    const errors: Record<string, string> = {};
    if (!phase && !selectedTournamentId) {
      errors.tournamentId = "Debes seleccionar un torneo.";
    }

    const parsedOrder = Number(order);
    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      errors.order = "El orden debe ser un entero mayor o igual a 1.";
    }

    if (phaseType === "GROUP") {
      if (!name.trim()) {
        errors.name = "El nombre es obligatorio.";
      }
    } else {
      if (!finalRound) {
        errors.finalRound = "Debes seleccionar una ronda.";
      }
    }

    setLocalErrors(errors);
    if (Object.keys(errors).length > 0) return null;

    return {
      phaseType,
      name: phaseType === "FINAL" ? getFinalRoundLabel(finalRound) : name.trim(),
      order: parsedOrder,
      finalRound: phaseType === "FINAL" ? (finalRound as FinalRound) : undefined,
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
      title={isEdit ? "Editar fase" : "Crear fase"}
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
            form="phase-form"
            className="btn btn-sports-primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear fase"}
          </button>
        </>
      }
    >
      <form id="phase-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert type="danger" message={error} onClose={() => {}} /> : null}
        {mergedErrors.tournamentId ? (
          <Alert type="danger" message={mergedErrors.tournamentId} onClose={() => {}} />
        ) : null}

        <div className="mb-3">
          <label htmlFor="phase-type" className="form-label">
            Tipo <span className="text-danger">*</span>
          </label>
          <select
            id="phase-type"
            className="form-select"
            value={phaseType}
            onChange={(e) => handlePhaseTypeChange(e.target.value as PhaseType)}
            disabled={submitting || isEdit}
          >
            <option value="GROUP">Grupo</option>
            <option value="FINAL">Final</option>
          </select>
        </div>

        {phaseType === "GROUP" ? (
          <div className="mb-3">
            <label htmlFor="phase-name" className="form-label">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="phase-name"
              type="text"
              className={`form-control ${mergedErrors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Grupo A"
              disabled={submitting}
            />
            {mergedErrors.name ? (
              <div className="invalid-feedback">{mergedErrors.name}</div>
            ) : null}
          </div>
        ) : (
          <div className="mb-3">
            <label htmlFor="phase-final-round" className="form-label">
              Ronda <span className="text-danger">*</span>
            </label>
            <select
              id="phase-final-round"
              className={`form-select ${mergedErrors.finalRound ? "is-invalid" : ""}`}
              value={finalRound}
              onChange={(e) => handleFinalRoundChange(e.target.value)}
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
            <div className="form-text">El nombre se completa automáticamente según la ronda.</div>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="phase-order" className="form-label">
            Orden <span className="text-danger">*</span>
          </label>
          <input
            id="phase-order"
            type="number"
            min={1}
            className={`form-control ${mergedErrors.order ? "is-invalid" : ""}`}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            disabled={submitting}
          />
          {mergedErrors.order ? (
            <div className="invalid-feedback">{mergedErrors.order}</div>
          ) : null}
        </div>
      </form>
    </GenericModal>
  );
}
