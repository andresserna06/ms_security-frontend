import React, { useEffect, useRef, useState } from "react";
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
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const [phone, setPhone] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");
  const [photoUrlInput, setPhotoUrlInput] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!visible || !user) return;

      setLoading(true);
      setConfirmDelete(false);
      setPhoneError(null);
      setBirthDateError(null);
      setCityError(null);
      setBioError(null);
      setPhotoError(null);
      setServerError(null);

      const profile = await profileService.getByUserId(user.id);
      if (profile && profile.id) {
        setHasExistingProfile(true);
        setPhone(profile.phone ?? "");
        setBirthDate(profile.birthDate ?? "");
        const existingPhoto = profile.photo ?? "";
        setPhoto(existingPhoto);
        setPhotoUrlInput(existingPhoto.startsWith("data:image/") ? "" : existingPhoto);
        setCity(profile.city ?? "");
        setBio(profile.bio ?? "");
      } else {
        setHasExistingProfile(false);
        setPhone("");
        setBirthDate("");
        setPhoto("");
        setPhotoUrlInput("");
        setCity("");
        setBio("");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [visible, user, profileService]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("La imagen no debe superar los 5 MB.");
      return;
    }

    setPhotoError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const maxSize = 320;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPhoto(compressedDataUrl);
        } else {
          setPhoto(result);
        }
      };
      img.onerror = () => {
        setPhoto(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhoto("");
    setPhotoUrlInput("");
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    if (city && city.trim().length > 100) {
      setCityError("La ciudad no puede superar los 100 caracteres");
      valid = false;
    } else {
      setCityError(null);
    }

    if (bio && bio.trim().length > 500) {
      setBioError("La descripción no puede superar los 500 caracteres");
      valid = false;
    } else {
      setBioError(null);
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
      photo: photo.trim() || undefined,
      city: city.trim() || undefined,
      bio: bio.trim() || undefined,
    });

    const result = hasExistingProfile
      ? await profileService.update(user.id, payload)
      : await profileService.create(user.id, payload);

    if (result === null) {
      setServerError(
        "No fue posible guardar el perfil. Verifica que la fecha sea pasada y que el teléfono no pertenezca a otro usuario."
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

  const userInitials = (user?.name ?? "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <GenericModal
      visible={visible}
      title={`Gestionar Perfil — ${user?.name ?? ""}`}
      onClose={onClose}
      size="lg"
      backdrop="static"
    >
      {serverError ? (
        <Alert type="danger" message={serverError} onClose={() => setServerError(null)} />
      ) : null}

      {loading ? (
        <Loader text="Cargando datos del perfil..." />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="card bg-body-tertiary border-0 mb-3">
            <div className="card-body">
              <label className="form-label fw-semibold mb-2">Fotografía de perfil</label>
              <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                <div
                  className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-primary text-white fw-bold shadow-sm flex-shrink-0"
                  style={{ width: "84px", height: "84px", fontSize: "1.5rem" }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={user?.name ?? "Avatar"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>

                <div className="flex-grow-1 w-100">
                  <input
                    type="url"
                    className="form-control form-control-sm mb-2"
                    placeholder="Pega aquí una URL de imagen (https://...)"
                    value={photoUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhotoUrlInput(val);
                      setPhoto(val);
                      if (photoError) setPhotoError(null);
                    }}
                  />

                  <div className="d-flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                    <GenericButton
                      label="Subir foto desde mi equipo"
                      variant="primary"
                      className="btn-sm fw-semibold"
                      onClick={() => fileInputRef.current?.click()}
                    />
                    {photo ? (
                      <GenericButton
                        label="Quitar foto"
                        variant="danger"
                        className="btn-sm text-white fw-semibold"
                        onClick={handleClearPhoto}
                      />
                    ) : null}
                  </div>

                  {photoError ? (
                    <div className="text-danger small mt-1">{photoError}</div>
                  ) : (
                    <div className="form-text small mt-1">
                      Puedes ingresar una URL o subir una imagen desde tu computador (se usará la
                      última que selecciones).
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
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
            </div>

            <div className="col-md-6">
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
            </div>
          </div>

          <FormInput
            label="Ciudad de residencia"
            name="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (cityError) setCityError(null);
            }}
            placeholder="Ej. Manizales, Caldas"
            error={cityError}
          />

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="bio" className="form-label">
                Descripción / Biografía
              </label>
              <span className="text-body-secondary small">{bio.length}/500</span>
            </div>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={500}
              className={`form-control ${bioError ? "is-invalid" : ""}`}
              placeholder="Escribe una breve descripción o perfil del usuario..."
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                if (bioError) setBioError(null);
              }}
            />
            {bioError ? <div className="invalid-feedback">{bioError}</div> : null}
          </div>

          {confirmDelete ? (
            <div className="alert alert-warning d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3 mb-0">
              <div className="small">
                <strong>¿Eliminar el perfil de {user?.name}?</strong>
                <div>
                  Se borrarán su fotografía, teléfono, fecha de nacimiento, ciudad y descripción.
                </div>
              </div>
              <div className="d-flex gap-2 flex-shrink-0">
                <GenericButton
                  label={submitting ? "Eliminando..." : "Sí, eliminar perfil"}
                  variant="danger"
                  className="btn-sm text-white fw-semibold"
                  disabled={submitting}
                  onClick={handleDeleteProfile}
                />
                <GenericButton
                  label="No, conservar"
                  variant="secondary"
                  className="btn-sm fw-semibold"
                  disabled={submitting}
                  onClick={() => setConfirmDelete(false)}
                />
              </div>
            </div>
          ) : null}

          <div className="d-flex justify-content-end align-items-center gap-2 mt-4">
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
              disabled={submitting || confirmDelete}
            />
            {hasExistingProfile ? (
              <GenericButton
                label="Eliminar perfil"
                variant="danger"
                className="text-white"
                disabled={submitting || confirmDelete}
                onClick={() => setConfirmDelete(true)}
              />
            ) : null}
            <GenericButton
              label="Cancelar"
              variant="secondary"
              disabled={submitting}
              onClick={() => onClose()}
            />
          </div>
        </form>
      )}
    </GenericModal>
  );
}
