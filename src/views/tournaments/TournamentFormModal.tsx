import React, { useEffect, useMemo, useState } from "react";
import { Tournament, TournamentPayload } from "../../models/Tournament";
import { Sport } from "../../models/Sport";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export interface TournamentFormModalProps {
  visible: boolean;
  tournamentToEdit: Tournament | null;
  sports: Sport[];
  loadingSports: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TournamentPayload) => Promise<void>;
}

export default function TournamentFormModal({
  visible,
  tournamentToEdit,
  sports,
  loadingSports,
  submitting,
  onClose,
  onSubmit,
}: TournamentFormModalProps) {
  const isEditMode = Boolean(tournamentToEdit);

  const [name, setName] = useState<string>("");
  const [sportId, setSportId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [enrollmentDeadline, setEnrollmentDeadline] = useState<string>("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [sportError, setSportError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [deadlineError, setDeadlineError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Only active sports can receive tournaments; on edit the current sport is
  // kept in the list even if it was deactivated later.
  const availableSports = useMemo(
    () =>
      sports.filter(
        (s) => s.active || (tournamentToEdit && s.id === tournamentToEdit.sportId),
      ),
    [sports, tournamentToEdit],
  );

  useEffect(() => {
    if (visible) {
      setName(tournamentToEdit?.name ?? "");
      setSportId(tournamentToEdit?.sportId ? String(tournamentToEdit.sportId) : "");
      setStartDate(tournamentToEdit?.startDate?.slice(0, 10) ?? "");
      setEnrollmentDeadline(tournamentToEdit?.enrollmentDeadline?.slice(0, 10) ?? "");
      setNameError(null);
      setSportError(null);
      setStartDateError(null);
      setDeadlineError(null);
      setServerError(null);
    }
  }, [visible, tournamentToEdit]);

  const validateForm = (): boolean => {
    let valid = true;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("El nombre es obligatorio.");
      valid = false;
    } else if (trimmedName.length > 120) {
      setNameError("El nombre no puede superar los 120 caracteres.");
      valid = false;
    } else {
      setNameError(null);
    }

    const parsedSport = Number(sportId);
    if (!sportId || !Number.isInteger(parsedSport) || parsedSport < 1) {
      setSportError("Debes seleccionar un deporte registrado.");
      valid = false;
    } else {
      setSportError(null);
    }

    const validStart = DATE_FORMAT.test(startDate);
    if (!validStart) {
      setStartDateError("La fecha de inicio es obligatoria.");
      valid = false;
    } else {
      setStartDateError(null);
    }

    if (!DATE_FORMAT.test(enrollmentDeadline)) {
      setDeadlineError("La fecha de cierre de inscripciones es obligatoria.");
      valid = false;
    } else if (validStart && enrollmentDeadline > startDate) {
      setDeadlineError(
        "El cierre de inscripciones no puede ser posterior a la fecha de inicio.",
      );
      valid = false;
    } else {
      setDeadlineError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setServerError(null);
    try {
      await onSubmit({
        name: name.trim(),
        sportId: Number(sportId),
        startDate,
        enrollmentDeadline,
      });
    } catch (err: any) {
      setServerError(err?.message || "No fue posible guardar el torneo.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title={isEditMode ? "Editar torneo" : "Registrar nuevo torneo"}
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

        {!loadingSports && availableSports.length === 0 ? (
          <Alert
            type="warning"
            message="No hay deportes activos registrados. Registra o activa un deporte antes de crear un torneo."
          />
        ) : null}

        <FormInput
          label="Nombre del torneo"
          name="tournament-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Copa Colombia de Fútbol 2027"
          required
          error={nameError}
        />

        <div className="mb-3">
          <label htmlFor="tournament-sport" className="form-label">
            Deporte <span className="text-danger">*</span>
          </label>
          <select
            id="tournament-sport"
            className={`form-select ${sportError ? "is-invalid" : ""}`}
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            disabled={loadingSports || submitting}
          >
            <option value="">
              {loadingSports ? "Cargando deportes..." : "Selecciona un deporte..."}
            </option>
            {availableSports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.parentSport
                  ? `${sport.name} (${sport.parentSport.name})`
                  : sport.name}
                {sport.active ? "" : " [Inactivo]"}
              </option>
            ))}
          </select>
          {sportError ? (
            <div className="invalid-feedback">{sportError}</div>
          ) : (
            <div className="form-text">
              Cada torneo debe pertenecer a un deporte registrado y activo.
            </div>
          )}
        </div>

        <div className="row">
          <div className="col-md-6">
            <FormInput
              label="Cierre de inscripciones"
              name="tournament-enrollmentDeadline"
              type="date"
              value={enrollmentDeadline}
              onChange={(e) => setEnrollmentDeadline(e.target.value)}
              required
              error={deadlineError}
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Fecha de inicio"
              name="tournament-startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              error={startDateError}
            />
          </div>
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
            disabled={submitting || (!isEditMode && availableSports.length === 0)}
          >
            {submitting
              ? "Guardando..."
              : isEditMode
                ? "Guardar cambios"
                : "Registrar torneo"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
