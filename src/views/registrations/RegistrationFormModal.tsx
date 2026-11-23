import React, { useEffect, useState } from "react";
import { Team } from "../../models/Team";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

export interface RegistrationFormModalProps {
  visible: boolean;
  teams: Team[];
  submitting: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (teamId: number) => Promise<void>;
}

export default function RegistrationFormModal({
  visible,
  teams,
  submitting,
  error,
  fieldErrors = {},
  onClose,
  onSubmit,
}: RegistrationFormModalProps) {
  const [teamId, setTeamId] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTeamId("");
      setLocalError(null);
    }
  }, [visible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    if (!teamId) {
      setLocalError("Debes seleccionar un equipo.");
      return;
    }
    const parsedTeamId = Number(teamId);
    if (!Number.isInteger(parsedTeamId) || parsedTeamId < 1) {
      setLocalError("Debes seleccionar un equipo válido.");
      return;
    }
    await onSubmit(parsedTeamId);
  };

  const teamError = localError || fieldErrors.teamId || null;

  return (
    <GenericModal
      visible={visible}
      title="Inscribir equipo"
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
            form="registration-form"
            className="btn btn-sports-primary"
            disabled={submitting || !teamId}
          >
            {submitting ? "Inscribiendo..." : "Inscribir"}
          </button>
        </>
      }
    >
      <form id="registration-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert type="danger" message={error} onClose={() => {}} /> : null}

        <div className="mb-3">
          <label htmlFor="registration-teamId" className="form-label">
            Equipo <span className="text-danger">*</span>
          </label>
          <select
            id="registration-teamId"
            name="teamId"
            className={`form-select ${teamError ? "is-invalid" : ""}`}
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            disabled={submitting}
            required
          >
            <option value="">Seleccione un equipo</option>
            {teams.map((team) => (
              <option key={team.id} value={String(team.id)}>
                {team.name}
              </option>
            ))}
          </select>
          {teamError ? <div className="invalid-feedback">{teamError}</div> : null}
        </div>
      </form>
    </GenericModal>
  );
}
