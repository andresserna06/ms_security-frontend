import React, { useEffect, useState } from "react";
import { User } from "../../models/User";
import { Profile } from "../../models/Profile";
import { IProfileService } from "../../services/interfaces/IProfileService";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";

export interface UserProfileModalProps {
  visible: boolean;
  user: User | null;
  profileService: IProfileService;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export default function UserProfileModal({
  visible,
  user,
  profileService,
  onClose,
  onSaved,
}: UserProfileModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasExistingProfile, setHasExistingProfile] = useState<boolean>(false);

  const [phone, setPhone] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!visible || !user) return;

      setLoading(true);
      setPhoneError(null);
      setBirthDateError(null);
      setServerError(null);

      const profile = await profileService.getByUserId(user.id);
      if (profile && profile.id) {
        setHasExistingProfile(true);
        setPhone(profile.phone ?? "");
        setBirthDate(profile.birthDate ?? "");
      } else {
        setHasExistingProfile(false);
        setPhone("");
        setBirthDate("");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [visible, user, profileService]);

  const validate = (): boolean => {
    let valid = true;

    if (!phone || phone.trim().length < 7 || phone.trim().length > 20) {
      setPhoneError("El teléfono debe tener entre 7 y 20 caracteres");
      valid = false;
    } else {
      setPhoneError(null);
    }

    if (!birthDate) {
      setBirthDateError("La fecha de nacimiento es obligatoria");
      valid = false;
    } else {
      setBirthDateError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setSubmitting(true);
    setServerError(null);

    const payload = new Profile({
      phone: phone.trim(),
      birthDate,
    });

    const result = hasExistingProfile
      ? await profileService.update(user.id, payload)
      : await profileService.create(user.id, payload);

    if (result === null) {
      setServerError(
        "No fue posible guardar el perfil. Verifica que la fecha sea pasada y el teléfono sea válido."
      );
    } else {
      onSaved(
        hasExistingProfile
          ? `Perfil de ${user.name} actualizado correctamente`
          : `Perfil de ${user.name} creado correctamente`
      );
      onClose();
    }

    setSubmitting(false);
  };

  const handleDeleteProfile = async () => {
    if (!user || !hasExistingProfile) return;

    setSubmitting(true);
    setServerError(null);

    const deleted = await profileService.remove(user.id);
    if (deleted) {
      onSaved(`Perfil de ${user.name} eliminado correctamente`);
      onClose();
    } else {
      setServerError("No fue posible eliminar el perfil del usuario.");
    }

    setSubmitting(false);
  };

  return (
    <GenericModal
      visible={visible}
      title={`Gestionar Perfil — ${user?.name ?? ""}`}
      onClose={onClose}
      backdrop="static"
    >
      {serverError ? (
        <Alert type="danger" message={serverError} onClose={() => setServerError(null)} />
      ) : null}

      {loading ? (
        <Loader text="Cargando datos del perfil..." />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Teléfono de contacto"
            name="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            placeholder="Ej. 3001234567"
            required
            error={phoneError}
          />

          <FormInput
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              if (birthDateError) setBirthDateError(null);
            }}
            required
            error={birthDateError}
          />

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              {hasExistingProfile ? (
                <GenericButton
                  label="Eliminar perfil"
                  variant="outline-danger"
                  disabled={submitting}
                  onClick={handleDeleteProfile}
                />
              ) : null}
            </div>
            <div className="d-flex gap-2">
              <GenericButton
                label="Cancelar"
                variant="outline-secondary"
                disabled={submitting}
                onClick={() => onClose()}
              />
              <GenericButton
                label={
                  submitting
                    ? "Guardando..."
                    : hasExistingProfile
                    ? "Actualizar perfil"
                    : "Crear perfil"
                }
                variant="primary"
                type="submit"
                disabled={submitting}
              />
            </div>
          </div>
        </form>
      )}
    </GenericModal>
  );
}
