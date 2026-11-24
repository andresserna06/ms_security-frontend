import React, { useEffect, useState } from "react";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

export interface AssociationOption {
  id: number;
  name: string;
}

export interface TeamSportFormModalProps {
  visible: boolean;
  // Name of the team or sport that receives the association.
  ownerName: string;
  // What is being associated to it.
  optionLabel: "deporte" | "equipo";
  options: AssociationOption[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (optionId: number) => Promise<void>;
}

export default function TeamSportFormModal({
  visible,
  ownerName,
  optionLabel,
  options,
  submitting,
  onClose,
  onSubmit,
}: TeamSportFormModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectError, setSelectError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedId("");
      setSelectError(null);
      setServerError(null);
    }
  }, [visible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = Number(selectedId);
    if (!selectedId || !Number.isInteger(parsed) || parsed < 1) {
      setSelectError(`Debes seleccionar un ${optionLabel}.`);
      return;
    }
    setSelectError(null);
    setServerError(null);
    try {
      await onSubmit(parsed);
    } catch (err: any) {
      setServerError(err?.message || "No fue posible registrar la asociación.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title={`Asociar ${optionLabel}`}
      onClose={submitting ? () => {} : onClose}
      backdrop="static"
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError ? (
          <Alert
            type="danger"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        ) : null}

        {options.length === 0 ? (
          <Alert
            type="warning"
            message={`No hay ${optionLabel}s activos disponibles para asociar a "${ownerName}".`}
          />
        ) : null}

        <p className="text-body-secondary small">
          Se asociará a <strong>{ownerName}</strong>. Solo se muestran los{" "}
          {optionLabel}s activos que aún no están asociados.
        </p>

        <div className="mb-3">
          <label htmlFor="team-sport-option" className="form-label">
            {optionLabel === "deporte" ? "Deporte" : "Equipo"}{" "}
            <span className="text-danger">*</span>
          </label>
          <select
            id="team-sport-option"
            className={`form-select ${selectError ? "is-invalid" : ""}`}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={submitting || options.length === 0}
          >
            <option value="">Selecciona un {optionLabel}...</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {selectError ? <div className="invalid-feedback">{selectError}</div> : null}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <GenericButton
            label="Cancelar"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          />
          <button
            type="submit"
            className="btn btn-sports-primary"
            disabled={submitting || options.length === 0}
          >
            {submitting ? "Guardando..." : "Asociar"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
