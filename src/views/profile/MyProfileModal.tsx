import React, { useEffect, useState, useRef } from "react";
import { CAvatar, CBadge } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCamera, cilTrash, cilLink } from "@coreui/icons";
import { User } from "../../models/User";
import { Profile } from "../../models/Profile";
import { IProfileService } from "../../services/interfaces/IProfileService";
import { IUserService } from "../../services/interfaces/IUserService";
import { AuthUserInfo } from "../../services/interfaces/IAuthService";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";

export interface MyProfileModalProps {
  visible: boolean;
  currentUser: AuthUserInfo | null;
  profileService: IProfileService;
  userService: IUserService;
  onClose: () => void;
  onProfileUpdated: (newName: string, newPhoto?: string) => void;
}

export default function MyProfileModal({
  visible,
  currentUser,
  profileService,
  userService,
  onClose,
  onProfileUpdated,
}: MyProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasExistingProfile, setHasExistingProfile] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!visible || !currentUser?.id) return;

      setLoading(true);
      setNameError(null);
      setPhoneError(null);
      setBirthDateError(null);
      setServerError(null);
      setSuccessMessage(null);
      setShowUrlInput(false);

      setName(currentUser.name || "");
      setPhoto(localStorage.getItem("userAvatar") || currentUser.avatar || "");

      try {
        const userDetail = await userService.getDetailWithProfile(currentUser.id);
        if (userDetail?.name) {
          setName(userDetail.name);
        }

        const profile = await profileService.getByUserId(currentUser.id);
        if (profile && profile.id) {
          setHasExistingProfile(true);
          setPhone(profile.phone ?? "");
          setBirthDate(profile.birthDate ?? "");
          setCity(profile.city ?? "");
          setBio(profile.bio ?? "");
          if (profile.photo) {
            setPhoto(profile.photo);
            localStorage.setItem("userAvatar", profile.photo);
          }
        } else {
          setHasExistingProfile(false);
          setPhone("");
          setBirthDate("");
          setCity("");
          setBio("");
        }
      } catch (err) {
        console.warn("Error cargando perfil del usuario:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [visible, currentUser, profileService, userService]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setServerError("El archivo seleccionado debe ser una imagen (JPG, PNG, GIF, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setServerError("La imagen no debe superar los 2 MB de tamaño.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = (): boolean => {
    let valid = true;

    if (!name.trim() || name.trim().length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
      valid = false;
    } else {
      setNameError(null);
    }

    if (phone.trim() && (phone.trim().length < 7 || phone.trim().length > 20)) {
      setPhoneError("El teléfono debe tener entre 7 y 20 caracteres");
      valid = false;
    } else {
      setPhoneError(null);
    }

    if (birthDate) {
      const selected = new Date(birthDate);
      if (selected >= new Date()) {
        setBirthDateError("La fecha de nacimiento debe ser una fecha pasada");
        valid = false;
      } else {
        setBirthDateError(null);
      }
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || !currentUser?.id) return;

    setSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const cleanName = name.trim();
      if (cleanName !== currentUser.name) {
        const updatedUser = await userService.update(
          currentUser.id,
          new User({ name: cleanName, email: currentUser.email })
        );
        if (updatedUser) {
          localStorage.setItem("userName", cleanName);
        }
      }

      const cleanPhone = phone.trim();
      const cleanBirthDate = birthDate.trim();
      const cleanCity = city.trim();
      const cleanBio = bio.trim();
      const cleanPhoto = photo.trim();

      if (cleanPhone || cleanBirthDate || cleanPhoto || cleanCity || cleanBio || hasExistingProfile) {
        const profilePayload = new Profile({
          phone: cleanPhone || undefined,
          birthDate: cleanBirthDate || undefined,
          photo: cleanPhoto || undefined,
          city: cleanCity || undefined,
          bio: cleanBio || undefined,
        });

        const savedProfile = hasExistingProfile
          ? await profileService.update(currentUser.id, profilePayload)
          : await profileService.create(currentUser.id, profilePayload);

        if (!savedProfile) {
          setServerError("No fue posible guardar los datos del perfil.");
          setSubmitting(false);
          return;
        }
        setHasExistingProfile(true);
      }

      if (cleanPhoto) {
        localStorage.setItem("userAvatar", cleanPhoto);
      } else {
        localStorage.removeItem("userAvatar");
      }

      onProfileUpdated(cleanName, cleanPhoto);
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { name: cleanName, photo: cleanPhoto, userId: currentUser.id },
        })
      );
      setSuccessMessage("Perfil actualizado exitosamente.");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setServerError(err?.message || "Ocurrió un error inesperado al actualizar el perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  const getProviderBadge = (provider?: string) => {
    const prov = (provider || "LOCAL").toUpperCase();
    if (prov.includes("AZURE") || prov.includes("MICROSOFT")) {
      return <CBadge color="primary">Azure</CBadge>;
    }
    if (prov.includes("GOOGLE")) {
      return <CBadge color="danger">Google</CBadge>;
    }
    if (prov.includes("GITHUB")) {
      return <CBadge color="dark">GitHub</CBadge>;
    }
    return <CBadge color="success">Local</CBadge>;
  };

  const currentDisplayAvatar =
    photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Usuario")}&background=2eb85c&color=fff&bold=true`;

  return (
    <GenericModal
      visible={visible}
      title="Mi Perfil de Usuario"
      onClose={onClose}
      backdrop="static"
    >
      {serverError ? (
        <Alert type="danger" message={serverError} onClose={() => setServerError(null)} />
      ) : null}

      {successMessage ? (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      ) : null}

      {loading ? (
        <Loader text="Cargando tu información..." />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="d-flex align-items-center gap-3 p-3 mb-3 rounded bg-body-tertiary border">
            <div className="position-relative">
              <CAvatar
                src={currentDisplayAvatar}
                size="xl"
                status="success"
                className="border shadow-sm"
              />
              <button
                type="button"
                className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1"
                title="Subir archivo desde el equipo"
                style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <CIcon icon={cilCamera} size="sm" />
              </button>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1 text-body fw-bold">{name || currentUser?.name || "Usuario"}</h5>
              <div className="text-body-secondary small mb-2">{currentUser?.email || ""}</div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {getProviderBadge(currentUser?.authProvider)}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary py-0 px-2 small"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                >
                  <CIcon icon={cilLink} className="me-1" size="sm" />
                  {showUrlInput ? "Ocultar URL" : "Usar URL de imagen"}
                </button>
                {photo ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0 text-decoration-none small ms-1"
                    onClick={handleRemovePhoto}
                  >
                    <CIcon icon={cilTrash} className="me-1" />
                    Quitar foto
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/*"
            onChange={handleImageChange}
          />

          {showUrlInput ? (
            <div className="mb-3 p-2 border rounded bg-light">
              <FormInput
                label="URL directa de la imagen"
                name="photoUrl"
                value={photo.startsWith("data:") ? "" : photo}
                onChange={(e) => setPhoto(e.target.value.trim())}
                placeholder="https://ejemplo.com/mi-avatar.jpg"
              />
              <div className="form-text small">
                Pega el enlace directo a tu imagen en internet para previsualizarla y guardarla.
              </div>
            </div>
          ) : null}

          <FormInput
            label="Nombre Completo"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="Ingresa tu nombre completo"
            required
            error={nameError}
          />

          <FormInput
            label="Correo Electrónico"
            name="email"
            value={currentUser?.email || ""}
            disabled
            readOnly
          />

          <div className="row">
            <div className="col-md-6">
              <FormInput
                label="Teléfono de contacto (opcional)"
                name="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError(null);
                }}
                placeholder="Ej. +57 300 1234567"
                error={phoneError}
              />
            </div>
            <div className="col-md-6">
              <FormInput
                label="Fecha de nacimiento (opcional)"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  if (birthDateError) setBirthDateError(null);
                }}
                error={birthDateError}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <FormInput
                label="Ciudad (opcional)"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Manizales"
              />
            </div>
            <div className="col-md-6">
              <FormInput
                label="Biografía / Descripción (opcional)"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Breve descripción personal..."
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <GenericButton
              label="Cerrar"
              variant="outline-secondary"
              disabled={submitting}
              onClick={onClose}
            />
            <GenericButton
              label={submitting ? "Guardando..." : "Guardar Cambios"}
              variant="primary"
              type="submit"
              disabled={submitting}
            />
          </div>
        </form>
      )}
    </GenericModal>
  );
}
