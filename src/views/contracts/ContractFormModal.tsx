import React, { useEffect, useMemo, useState } from "react";
import { Player } from "../../models/Player";
import { CreatePlayerContractPayload } from "../../models/PlayerContract";
import { User } from "../../models/User";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";

export interface ContractFormModalProps {
  visible: boolean;
  teamName: string;
  players: Player[];
  usersById: Map<number, User>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePlayerContractPayload) => Promise<void>;
}

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ContractFormModal({
  visible,
  teamName,
  players,
  usersById,
  submitting,
  onClose,
  onSubmit,
}: ContractFormModalProps) {
  const [playerId, setPlayerId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getTodayIso());
  const [endDate, setEndDate] = useState<string>("");

  const [playerError, setPlayerError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const activePlayers = useMemo(
    () => players.filter((p) => p.active),
    [players],
  );

  const selectedPlayer = useMemo(
    () => activePlayers.find((p) => String(p.id) === playerId) ?? null,
    [activePlayers, playerId],
  );

  useEffect(() => {
    if (visible) {
      setPlayerId("");
      setStartDate(getTodayIso());
      setEndDate("");
      setPlayerError(null);
      setStartDateError(null);
      setEndDateError(null);
      setServerError(null);
    }
  }, [visible]);

  const validate = (): boolean => {
    let valid = true;

    const parsedPlayerId = Number(playerId);
    if (!playerId || !Number.isInteger(parsedPlayerId) || parsedPlayerId < 1) {
      setPlayerError("Debes seleccionar un jugador activo.");
      valid = false;
    } else {
      setPlayerError(null);
    }

    if (!startDate.trim()) {
      setStartDateError("La fecha de inicio es obligatoria.");
      valid = false;
    } else {
      setStartDateError(null);
    }

    if (endDate.trim() && startDate.trim() && endDate < startDate) {
      setEndDateError(
        "La fecha de fin no puede ser anterior a la fecha de inicio.",
      );
      valid = false;
    } else {
      setEndDateError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreatePlayerContractPayload = {
      playerId: Number(playerId),
      startDate: startDate.trim(),
    };

    if (endDate.trim()) {
      payload.endDate = endDate.trim();
    }

    setServerError(null);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      setServerError(err?.message || "No fue posible registrar el contrato.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title="Nuevo contrato de jugador"
      onClose={submitting ? () => {} : onClose}
      backdrop="static"
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-body-secondary small mb-3">
          Equipo destino: <strong>{teamName}</strong>
        </p>

        {serverError ? (
          <Alert
            type="danger"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        ) : null}

        {activePlayers.length === 0 ? (
          <Alert
            type="warning"
            message="No hay jugadores activos disponibles para contratar."
          />
        ) : null}

        <div className="mb-3">
          <label htmlFor="contract-player-select" className="form-label">
            Jugador activo <span className="text-danger">*</span>
          </label>
          <select
            id="contract-player-select"
            className={`form-select ${playerError ? "is-invalid" : ""}`}
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            disabled={submitting || activePlayers.length === 0}
            required
          >
            <option value="">Selecciona un jugador...</option>
            {activePlayers.map((player) => {
              const user = usersById.get(Number(player.userId));
              const name = user?.name || `Usuario #${player.userId}`;
              return (
                <option key={player.id} value={player.id}>
                  {name}
                </option>
              );
            })}
          </select>
          {playerError ? (
            <div className="invalid-feedback">{playerError}</div>
          ) : selectedPlayer ? (
            <div className="form-text">
              Documento: <strong>{selectedPlayer.document}</strong> • Posición:{" "}
              <strong>{selectedPlayer.position || "Sin definir"}</strong>
            </div>
          ) : null}
        </div>

        <div className="row">
          <div className="col-md-6">
            <FormInput
              label="Fecha de inicio"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              error={startDateError}
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Fecha de fin (opcional)"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={endDateError}
            />
          </div>
        </div>
        <div className="form-text mt-n2 mb-3">
          Deja la fecha de fin vacía si el contrato es vigente sin fecha de cierre definida.
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
            disabled={submitting || activePlayers.length === 0}
          >
            {submitting ? "Registrando..." : "Registrar contrato"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
