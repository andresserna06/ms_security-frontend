import React, { useEffect, useMemo, useState } from "react";
import { Player, PlayerPayload } from "../../models/Player";
import { User } from "../../models/User";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";

export interface PlayerFormModalProps {
  visible: boolean;
  playerToEdit: Player | null;
  users: User[];
  assignedUserIds: Set<number>;
  loadingUsers: boolean;
  usersLoadError?: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PlayerPayload) => Promise<void>;
}

export default function PlayerFormModal({
  visible,
  playerToEdit,
  users,
  assignedUserIds,
  loadingUsers,
  usersLoadError = null,
  submitting,
  onClose,
  onSubmit,
}: PlayerFormModalProps) {
  const isEditMode = Boolean(playerToEdit);

  const [userId, setUserId] = useState<string>("");
  const [document, setDocument] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [jerseyNumber, setJerseyNumber] = useState<string>("");

  const [userIdError, setUserIdError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [jerseyNumberError, setJerseyNumberError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const availableUsers = useMemo(() => {
    return users.filter((u) => {
      const isCurrentUser = isEditMode && playerToEdit && u.id === playerToEdit.userId;
      if (isCurrentUser) return true;
      if (assignedUserIds.has(u.id)) return false;
      if (!isEditMode && u.active === false) return false;
      return true;
    });
  }, [users, assignedUserIds, isEditMode, playerToEdit]);

  useEffect(() => {
    if (visible) {
      if (playerToEdit) {
        setUserId(String(playerToEdit.userId ?? ""));
        setDocument(playerToEdit.document ?? "");
        setPosition(playerToEdit.position ?? "");
        setJerseyNumber(
          playerToEdit.jerseyNumber !== null && playerToEdit.jerseyNumber !== undefined
            ? String(playerToEdit.jerseyNumber)
            : "",
        );
      } else {
        setUserId("");
        setDocument("");
        setPosition("");
        setJerseyNumber("");
      }
      setUserIdError(null);
      setDocumentError(null);
      setPositionError(null);
      setJerseyNumberError(null);
      setServerError(null);
    }
  }, [visible, playerToEdit]);

  const validateForm = (): boolean => {
    let valid = true;

    const parsedUserId = Number(userId);
    if (!userId || !Number.isInteger(parsedUserId) || parsedUserId < 1) {
      setUserIdError("Debes seleccionar un usuario válido.");
      valid = false;
    } else {
      setUserIdError(null);
    }

    const trimmedDoc = document.trim();
    if (!trimmedDoc) {
      setDocumentError("El documento es obligatorio.");
      valid = false;
    } else if (trimmedDoc.length > 30) {
      setDocumentError("El documento no puede superar los 30 caracteres.");
      valid = false;
    } else {
      setDocumentError(null);
    }

    const trimmedPos = position.trim();
    if (position.length > 0 && !trimmedPos) {
      setPositionError("La posición no puede contener solo espacios.");
      valid = false;
    } else if (trimmedPos.length > 60) {
      setPositionError("La posición no puede superar los 60 caracteres.");
      valid = false;
    } else {
      setPositionError(null);
    }

    if (jerseyNumber.trim().length > 0) {
      const parsedJersey = Number(jerseyNumber);
      if (
        !Number.isInteger(parsedJersey) ||
        parsedJersey < 0 ||
        parsedJersey > 99
      ) {
        setJerseyNumberError("El dorsal debe ser un número entero entre 0 y 99.");
        valid = false;
      } else {
        setJerseyNumberError(null);
      }
    } else {
      setJerseyNumberError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: PlayerPayload = {
      userId: Number(userId),
      document: document.trim(),
    };

    const trimmedPos = position.trim();
    if (trimmedPos.length > 0) {
      payload.position = trimmedPos;
    }

    if (jerseyNumber.trim().length > 0) {
      payload.jerseyNumber = Number(jerseyNumber);
    }

    setServerError(null);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      setServerError(err?.message || "No fue posible guardar el jugador.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title={isEditMode ? "Editar jugador" : "Registrar nuevo jugador"}
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

        {usersLoadError ? (
          <Alert type="danger" message={usersLoadError} />
        ) : !isEditMode && !loadingUsers && availableUsers.length === 0 ? (
          <Alert
            type="warning"
            message="No hay usuarios disponibles para registrar como jugador. Verifica que existan usuarios activos sin ficha asignada."
          />
        ) : null}

        <div className="mb-3">
          <label htmlFor="player-userId" className="form-label">
            Usuario <span className="text-danger">*</span>
          </label>
          <select
            id="player-userId"
            name="userId"
            className={`form-select ${userIdError ? "is-invalid" : ""}`}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loadingUsers || submitting || Boolean(usersLoadError)}
            required
          >
            <option value="">
              {loadingUsers ? "Cargando usuarios..." : "Selecciona un usuario..."}
            </option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || `Usuario #${u.id}`} ({u.email || "sin correo"})
                {u.active === false ? " (inactivo)" : ""}
              </option>
            ))}
          </select>
          {userIdError ? (
            <div className="invalid-feedback">{userIdError}</div>
          ) : (
            <div className="form-text">
              Solo se muestran usuarios activos que aún no están registrados como jugadores.
            </div>
          )}
        </div>

        <FormInput
          label="Documento de identidad"
          name="document"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="Ej. CC-1053800123"
          required
          error={documentError}
        />

        <div className="row">
          <div className="col-md-8">
            <FormInput
              label="Posición deportiva"
              name="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ej. Delantero, Portero, Base (opcional)"
              error={positionError}
            />
          </div>
          <div className="col-md-4">
            <FormInput
              label="Dorsal (0–99)"
              name="jerseyNumber"
              type="number"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              placeholder="Ej. 10"
              error={jerseyNumberError}
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
            disabled={
              submitting || (!isEditMode && availableUsers.length === 0)
            }
          >
            {submitting
              ? "Guardando..."
              : isEditMode
              ? "Guardar cambios"
              : "Registrar jugador"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
