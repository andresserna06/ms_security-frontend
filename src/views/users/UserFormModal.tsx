import React, { useEffect, useState } from "react";
import { User } from "../../models/User";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";

export interface UserFormModalProps {
  visible: boolean;
  userToEdit: User | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (user: User) => Promise<void>;
}

export default function UserFormModal({
  visible,
  userToEdit,
  submitting,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEditMode = Boolean(userToEdit);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (userToEdit) {
        setName(userToEdit.name ?? "");
        setEmail(userToEdit.email ?? "");
        setPassword("");
        setActive(userToEdit.active !== false);
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setActive(true);
      }
      setNameError(null);
      setEmailError(null);
      setPasswordError(null);
      setServerError(null);
    }
  }, [visible, userToEdit]);

  const validateForm = (): boolean => {
    let valid = true;

    if (!name || name.trim().length < 2) {
      setNameError("El nombre debe tener entre 2 y 100 caracteres");
      valid = false;
    } else {
      setNameError(null);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setEmailError("Ingresa un correo electrónico válido");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!isEditMode) {
      if (!password || password.length < 8) {
        setPasswordError("La contraseña es obligatoria y debe tener mínimo 8 caracteres");
        valid = false;
      } else {
        setPasswordError(null);
      }
    } else if (password && password.length < 8) {
      setPasswordError("Si deseas cambiar la contraseña, debe tener mínimo 8 caracteres");
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userPayload = new User({
      id: userToEdit?.id ?? 0,
      name: name.trim(),
      email: email.trim(),
      active: isEditMode ? active : true,
    });

    if (!isEditMode || (password && password.trim().length > 0)) {
      userPayload.password = password;
    }

    setServerError(null);
    try {
      await onSubmit(userPayload);
    } catch (err: any) {
      setServerError(err?.message || "No fue posible guardar el usuario.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title={isEditMode ? "Editar usuario" : "Registrar nuevo usuario"}
      onClose={onClose}
      backdrop="static"
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError ? (
          <Alert type="danger" message={serverError} onClose={() => setServerError(null)} />
        ) : null}

        <FormInput
          label="Nombre completo"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          placeholder="Ej. Carlos Administrador"
          required
          error={nameError}
        />

        <FormInput
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          placeholder="Ej. usuario@correo.com"
          required
          error={emailError}
        />

        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
          }}
          placeholder={
            isEditMode
              ? "Dejar en blanco para mantener la contraseña actual"
              : "Mínimo 8 caracteres"
          }
          required={!isEditMode}
          error={passwordError}
        />

        {isEditMode ? (
          <div className="mb-3">
            <label htmlFor="user-active" className="form-label">
              Estado del usuario
            </label>
            <select
              id="user-active"
              className="form-select"
              value={String(active)}
              onChange={(e) => setActive(e.target.value === "true")}
              disabled={submitting}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        ) : null}

        <div className="d-flex justify-content-end gap-2 mt-4">
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
                : isEditMode
                ? "Guardar cambios"
                : "Registrar usuario"
            }
            variant="primary"
            type="submit"
            disabled={submitting}
          />
        </div>
      </form>
    </GenericModal>
  );
}
