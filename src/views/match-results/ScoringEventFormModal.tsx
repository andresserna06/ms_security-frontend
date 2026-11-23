import React, { useEffect, useMemo, useState } from "react";
import { Player } from "../../models/Player";
import { ScoringEvent, ScoringEventPayload } from "../../models/ScoringEvent";
import { Team } from "../../models/Team";
import { User } from "../../models/User";
import { IPlayerContractService } from "../../services/interfaces/IPlayerContractService";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";

const SUGGESTED_TYPES = ["GOL", "PENAL", "TRIPLE", "PUNTO", "TIRO LIBRE"];

export interface ScoringEventFormModalProps {
  visible: boolean;
  eventToEdit: ScoringEvent | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  allPlayers: Player[];
  usersById: Map<number, User>;
  usersLoaded: boolean;
  playerContractService: IPlayerContractService;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ScoringEventPayload) => Promise<void>;
}

export default function ScoringEventFormModal({
  visible,
  eventToEdit,
  homeTeam,
  awayTeam,
  allPlayers,
  usersById,
  usersLoaded,
  playerContractService,
  submitting,
  onClose,
  onSubmit,
}: ScoringEventFormModalProps) {
  const isEditMode = Boolean(eventToEdit);

  const participatingTeams = useMemo(() => {
    const list: Team[] = [];
    if (homeTeam) list.push(homeTeam);
    if (awayTeam) list.push(awayTeam);
    return list;
  }, [homeTeam, awayTeam]);

  const [teamId, setTeamId] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [type, setType] = useState<string>("");

  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loadingTeamPlayers, setLoadingTeamPlayers] = useState<boolean>(false);
  const [showAllPlayers, setShowAllPlayers] = useState<boolean>(false);

  const [teamError, setTeamError] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [minuteError, setMinuteError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (eventToEdit) {
        setTeamId(String(eventToEdit.teamId));
        setPlayerId(String(eventToEdit.playerId));
        setMinute(String(eventToEdit.minute));
        setType(eventToEdit.type);
      } else {
        setTeamId(participatingTeams[0] ? String(participatingTeams[0].id) : "");
        setPlayerId("");
        setMinute("");
        setType("GOL");
      }
      setShowAllPlayers(false);
      setTeamError(null);
      setPlayerError(null);
      setMinuteError(null);
      setTypeError(null);
      setServerError(null);
    }
  }, [visible, eventToEdit, participatingTeams]);

  useEffect(() => {
    if (!visible || !teamId) {
      setTeamPlayers([]);
      return;
    }

    let active = true;
    setLoadingTeamPlayers(true);
    playerContractService
      .getTeamPlayers(Number(teamId))
      .then((contracts) => {
        if (!active) return;
        const uniqueByPlayer = new Map<number, Player>();
        contracts.forEach((c) => {
          if (c.player) {
            uniqueByPlayer.set(c.player.id, c.player);
          }
        });
        setTeamPlayers(Array.from(uniqueByPlayer.values()));
      })
      .catch(() => {
        if (active) setTeamPlayers([]);
      })
      .finally(() => {
        if (active) setLoadingTeamPlayers(false);
      });

    return () => {
      active = false;
    };
  }, [visible, teamId, playerContractService]);

  const selectablePlayers = useMemo(() => {
    const base = showAllPlayers || teamPlayers.length === 0
      ? allPlayers.filter((p) => p.active || String(p.id) === playerId)
      : teamPlayers;

    if (
      eventToEdit &&
      !base.some((p) => p.id === eventToEdit.playerId)
    ) {
      const existing = allPlayers.find((p) => p.id === eventToEdit.playerId);
      if (existing) {
        return [existing, ...base];
      }
    }
    return base;
  }, [showAllPlayers, teamPlayers, allPlayers, playerId, eventToEdit]);

  const selectedPlayer = useMemo(
    () => selectablePlayers.find((p) => String(p.id) === playerId) ?? null,
    [selectablePlayers, playerId],
  );

  const getPlayerLabel = (player: Player): string => {
    const user = usersById.get(Number(player.userId));
    if (!user) {
      return usersLoaded
        ? `Cuenta eliminada (ID #${player.userId})`
        : `Usuario #${player.userId}`;
    }
    return user.name || `Usuario #${player.userId}`;
  };

  const validate = (): boolean => {
    let valid = true;

    const parsedTeamId = Number(teamId);
    if (!teamId || !Number.isInteger(parsedTeamId) || parsedTeamId < 1) {
      setTeamError("Debes seleccionar uno de los equipos del partido.");
      valid = false;
    } else {
      setTeamError(null);
    }

    const parsedPlayerId = Number(playerId);
    if (!playerId || !Number.isInteger(parsedPlayerId) || parsedPlayerId < 1) {
      setPlayerError("Debes seleccionar el jugador que realizó la anotación.");
      valid = false;
    } else {
      setPlayerError(null);
    }

    const parsedMinute = Number(minute);
    if (
      minute.trim() === "" ||
      !Number.isInteger(parsedMinute) ||
      parsedMinute < 0
    ) {
      setMinuteError("El minuto debe ser un número entero mayor o igual a 0.");
      valid = false;
    } else {
      setMinuteError(null);
    }

    const trimmedType = type.trim();
    if (!trimmedType) {
      setTypeError("El tipo de anotación es obligatorio.");
      valid = false;
    } else if (trimmedType.length > 50) {
      setTypeError("El tipo de anotación no puede superar los 50 caracteres.");
      valid = false;
    } else {
      setTypeError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);
    try {
      await onSubmit({
        teamId: Number(teamId),
        playerId: Number(playerId),
        minute: Number(minute),
        type: type.trim(),
      });
    } catch (err: any) {
      setServerError(err?.message || "No fue posible guardar la anotación.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title={isEditMode ? "Editar anotación" : "Registrar nueva anotación"}
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

        <div className="mb-3">
          <label htmlFor="scoring-team-select" className="form-label">
            Equipo participante <span className="text-danger">*</span>
          </label>
          <select
            id="scoring-team-select"
            className={`form-select ${teamError ? "is-invalid" : ""}`}
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value);
              setPlayerId("");
            }}
            disabled={submitting || participatingTeams.length === 0}
            required
          >
            <option value="">Selecciona un equipo...</option>
            {participatingTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {teamError ? <div className="invalid-feedback">{teamError}</div> : null}
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label htmlFor="scoring-player-select" className="form-label mb-0">
              Jugador <span className="text-danger">*</span>
            </label>
            <div className="form-check form-switch mb-0">
              <input
                id="scoring-show-all-players"
                className="form-check-input"
                type="checkbox"
                checked={showAllPlayers}
                onChange={(e) => setShowAllPlayers(e.target.checked)}
                disabled={submitting}
              />
              <label
                htmlFor="scoring-show-all-players"
                className="form-check-label small text-body-secondary"
              >
                Mostrar todos los activos
              </label>
            </div>
          </div>

          <select
            id="scoring-player-select"
            className={`form-select ${playerError ? "is-invalid" : ""}`}
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            disabled={submitting || loadingTeamPlayers || !teamId}
            required
          >
            <option value="">
              {loadingTeamPlayers
                ? "Cargando jugadores del equipo..."
                : "Selecciona un jugador..."}
            </option>
            {selectablePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {getPlayerLabel(player)}
              </option>
            ))}
          </select>

          {playerError ? (
            <div className="invalid-feedback">{playerError}</div>
          ) : selectedPlayer ? (
            <div className="form-text">
              Documento: <strong>{selectedPlayer.document}</strong> • Posición:{" "}
              <strong>{selectedPlayer.position || "Sin definir"}</strong>
            </div>
          ) : teamId && !loadingTeamPlayers && teamPlayers.length === 0 ? (
            <div className="form-text">
              Este equipo no tiene contratos registrados; se muestran los jugadores activos disponibles.
            </div>
          ) : null}
        </div>

        <div className="row">
          <div className="col-md-4">
            <FormInput
              label="Minuto"
              name="minute"
              type="number"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Ej. 42"
              required
              error={minuteError}
            />
          </div>
          <div className="col-md-8">
            <FormInput
              label="Tipo de anotación"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ej. GOL, PENAL, TRIPLE, PUNTO"
              required
              error={typeError}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-1 mb-3">
          {SUGGESTED_TYPES.map((suggested) => (
            <button
              key={suggested}
              type="button"
              className={`btn btn-sm ${
                type.trim().toUpperCase() === suggested
                  ? "btn-sports-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setType(suggested)}
              disabled={submitting}
            >
              {suggested}
            </button>
          ))}
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
            disabled={submitting}
          >
            {submitting
              ? "Guardando..."
              : isEditMode
              ? "Guardar cambios"
              : "Registrar anotación"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
