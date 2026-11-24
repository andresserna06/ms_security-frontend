import React, { useEffect, useState } from "react";
import { Team, TeamPayload } from "../../models/Team";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";
import TeamLogo from "../../components/common/TeamLogo";
import { ACCEPTED_IMAGE_TYPES, resizeImageFile } from "../../utils/imageResize";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FOUNDED_YEAR = 1800;

export interface TeamFormModalProps {
  visible: boolean;
  teamToEdit: Team | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TeamPayload) => Promise<void>;
}

export default function TeamFormModal({
  visible,
  teamToEdit,
  submitting,
  onClose,
  onSubmit,
}: TeamFormModalProps) {
  const isEditMode = Boolean(teamToEdit);
  const currentYear = new Date().getFullYear();

  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [foundedYear, setFoundedYear] = useState<string>("");
  const [logo, setLogo] = useState<string>("");
  const [processingLogo, setProcessingLogo] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [foundedYearError, setFoundedYearError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(teamToEdit?.name ?? "");
      setCity(teamToEdit?.city ?? "");
      setContactEmail(teamToEdit?.contactEmail ?? "");
      setFoundedYear(
        teamToEdit?.foundedYear !== null && teamToEdit?.foundedYear !== undefined
          ? String(teamToEdit.foundedYear)
          : "",
      );
      setLogo(teamToEdit?.logo ?? "");
      setLogoError(null);
      setNameError(null);
      setCityError(null);
      setEmailError(null);
      setFoundedYearError(null);
      setServerError(null);
    }
  }, [visible, teamToEdit]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setProcessingLogo(true);
    try {
      setLogo(await resizeImageFile(file));
      setLogoError(null);
    } catch (err: any) {
      setLogoError(err?.message || "No fue posible cargar la imagen.");
    } finally {
      setProcessingLogo(false);
    }
  };

  const validateRequiredText = (
    value: string,
    label: string,
    maxLength: number,
    setError: (error: string | null) => void,
  ): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(`${label} es obligatorio.`);
      return false;
    }
    if (trimmed.length > maxLength) {
      setError(`${label} no puede superar los ${maxLength} caracteres.`);
      return false;
    }
    setError(null);
    return true;
  };

  const validateForm = (): boolean => {
    const validName = validateRequiredText(name, "El nombre", 120, setNameError);
    const validCity = validateRequiredText(city, "La ciudad", 100, setCityError);

    let validEmail = validateRequiredText(
      contactEmail,
      "El correo de contacto",
      150,
      setEmailError,
    );
    if (validEmail && !EMAIL_PATTERN.test(contactEmail.trim())) {
      setEmailError("El correo de contacto no tiene un formato válido.");
      validEmail = false;
    }

    let validYear = true;
    if (foundedYear.trim().length > 0) {
      const parsed = Number(foundedYear);
      if (
        !Number.isInteger(parsed) ||
        parsed < MIN_FOUNDED_YEAR ||
        parsed > currentYear
      ) {
        setFoundedYearError(
          `El año de fundación debe ser un número entre ${MIN_FOUNDED_YEAR} y ${currentYear}.`,
        );
        validYear = false;
      } else {
        setFoundedYearError(null);
      }
    } else {
      setFoundedYearError(null);
    }

    return validName && validCity && validEmail && validYear;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: TeamPayload = {
      name: name.trim(),
      city: city.trim(),
      contactEmail: contactEmail.trim(),
    };
    if (foundedYear.trim().length > 0) {
      payload.foundedYear = Number(foundedYear);
    }
    if (logo) {
      payload.logo = logo;
    }

    setServerError(null);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      setServerError(err?.message || "No fue posible guardar el equipo.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title={isEditMode ? "Editar equipo" : "Registrar nuevo equipo"}
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

        <div className="d-flex align-items-center gap-3 mb-3">
          <TeamLogo name={name || "Equipo"} logo={logo} size={64} />
          <div className="flex-grow-1">
            <label htmlFor="team-logo" className="form-label mb-1">
              Escudo del equipo
            </label>
            <div className="d-flex flex-wrap gap-2">
              <input
                id="team-logo"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className={`form-control ${logoError ? "is-invalid" : ""}`}
                style={{ maxWidth: "320px" }}
                onChange={handleLogoChange}
                disabled={submitting || processingLogo}
              />
              {logo ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setLogo("")}
                  disabled={submitting}
                >
                  Quitar escudo
                </button>
              ) : null}
            </div>
            {logoError ? (
              <div className="invalid-feedback d-block">{logoError}</div>
            ) : (
              <div className="form-text">
                Opcional. PNG, JPG, WEBP o GIF; se ajusta automáticamente a 256 px.
              </div>
            )}
          </div>
        </div>

        <FormInput
          label="Nombre del equipo"
          name="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Atlético Manizales"
          required
          error={nameError}
        />

        <div className="row">
          <div className="col-md-6">
            <FormInput
              label="Ciudad"
              name="team-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej. Manizales"
              required
              error={cityError}
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Año de fundación"
              name="team-foundedYear"
              type="number"
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder={`Ej. 1995 (opcional)`}
              error={foundedYearError}
            />
          </div>
        </div>

        <FormInput
          label="Correo de contacto"
          name="team-contactEmail"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="Ej. contacto@equipo.com"
          required
          error={emailError}
        />

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
            disabled={submitting || processingLogo}
          >
            {submitting
              ? "Guardando..."
              : isEditMode
                ? "Guardar cambios"
                : "Registrar equipo"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
