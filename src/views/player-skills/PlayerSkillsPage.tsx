import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CBadge } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilStar, cilUser } from "@coreui/icons";
import { Player } from "../../models/Player";
import { Skill } from "../../models/Skill";
import {
  PlayerAssignedSkill,
  SkillAssignedPlayer,
} from "../../models/PlayerSkill";
import { User } from "../../models/User";
import { IPlayerService } from "../../services/interfaces/IPlayerService";
import { ISkillService } from "../../services/interfaces/ISkillService";
import { IPlayerSkillService } from "../../services/interfaces/IPlayerSkillService";
import { IUserService } from "../../services/interfaces/IUserService";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import PlayerSkillsTable from "./PlayerSkillsTable";
import SkillPlayersTable from "./SkillPlayersTable";
import AssignSkillModal from "./AssignSkillModal";

type ActiveTab = "BY_PLAYER" | "BY_SKILL";

export interface PlayerSkillsPageProps {
  playerService?: IPlayerService;
  skillService?: ISkillService;
  playerSkillService?: IPlayerSkillService;
  userService?: IUserService;
}

export default function PlayerSkillsPage({
  playerService = serviceContainer.playerService,
  skillService = serviceContainer.skillService,
  playerSkillService = serviceContainer.playerSkillService,
  userService = serviceContainer.userService,
}: PlayerSkillsPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("BY_PLAYER");

  const [players, setPlayers] = useState<Player[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState<boolean>(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerSkills, setPlayerSkills] = useState<PlayerAssignedSkill[] | null>(
    null,
  );
  const [loadingPlayerSkills, setLoadingPlayerSkills] = useState<boolean>(false);

  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [skillPlayers, setSkillPlayers] = useState<SkillAssignedPlayer[] | null>(
    null,
  );
  const [loadingSkillPlayers, setLoadingSkillPlayers] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [assignModalVisible, setAssignModalVisible] = useState<boolean>(false);
  const [assigning, setAssigning] = useState<boolean>(false);

  const [skillToRemove, setSkillToRemove] = useState<PlayerAssignedSkill | null>(
    null,
  );
  const [removing, setRemoving] = useState<boolean>(false);

  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((u) => map.set(Number(u.id), u));
    return map;
  }, [users]);

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
  );

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? null,
    [skills, selectedSkillId],
  );

  const assignedSkillIds = useMemo(
    () => new Set((playerSkills ?? []).map((ps) => ps.skillId)),
    [playerSkills],
  );

  const formatPlayerName = useCallback(
    (player: Player): string => {
      const user = usersById.get(Number(player.userId));
      if (!user) {
        return usersLoaded
          ? `Cuenta eliminada (ID #${player.userId})`
          : `Usuario #${player.userId}`;
      }
      return user.name || `Usuario #${player.userId}`;
    },
    [usersById, usersLoaded],
  );

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setError(null);
    try {
      const [allPlayers, allSkills, allUsers] = await Promise.all([
        playerService.getAll({ all: true }),
        skillService.getAll(),
        userService.getUsersForSelector(),
      ]);
      setPlayers(allPlayers);
      setSkills(allSkills);
      if (allUsers) {
        setUsers(allUsers);
        setUsersLoaded(true);
      }
      if (allPlayers.length > 0) {
        setSelectedPlayerId((prev) =>
          prev && allPlayers.some((p) => p.id === prev) ? prev : allPlayers[0].id,
        );
      }
      if (allSkills.length > 0) {
        setSelectedSkillId((prev) =>
          prev && allSkills.some((s) => s.id === prev) ? prev : allSkills[0].id,
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
        "No fue posible cargar los catálogos de jugadores y habilidades.",
      );
    } finally {
      setLoadingCatalogs(false);
    }
  }, [playerService, skillService, userService]);

  const fetchPlayerSkills = useCallback(
    async (playerId: number | null) => {
      if (!playerId) {
        setPlayerSkills([]);
        return;
      }
      setLoadingPlayerSkills(true);
      setError(null);
      try {
        const result = await playerSkillService.getByPlayer(playerId);
        setPlayerSkills(result);
      } catch (err: any) {
        setError(
          err?.message || "No fue posible obtener las habilidades del jugador.",
        );
        setPlayerSkills(null);
      } finally {
        setLoadingPlayerSkills(false);
      }
    },
    [playerSkillService],
  );

  const fetchSkillPlayers = useCallback(
    async (skillId: number | null) => {
      if (!skillId) {
        setSkillPlayers([]);
        return;
      }
      setLoadingSkillPlayers(true);
      setError(null);
      try {
        const result = await playerSkillService.getPlayersBySkill(skillId);
        setSkillPlayers(result);
      } catch (err: any) {
        setError(
          err?.message ||
          "No fue posible obtener los jugadores con esta habilidad.",
        );
        setSkillPlayers(null);
      } finally {
        setLoadingSkillPlayers(false);
      }
    },
    [playerSkillService],
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    if (activeTab === "BY_PLAYER") {
      fetchPlayerSkills(selectedPlayerId);
    }
  }, [activeTab, selectedPlayerId, fetchPlayerSkills]);

  useEffect(() => {
    if (activeTab === "BY_SKILL") {
      fetchSkillPlayers(selectedSkillId);
    }
  }, [activeTab, selectedSkillId, fetchSkillPlayers]);

  const handleAssignSubmit = async (skillId: number, level?: number) => {
    if (!selectedPlayerId) return;
    setAssigning(true);
    try {
      await playerSkillService.assignSkill(
        selectedPlayerId,
        skillId,
        level !== undefined ? { level } : undefined,
      );
      const assignedSkill = skills.find((s) => s.id === skillId);
      setSuccess(
        `Habilidad "${assignedSkill?.name || `#${skillId}`}" asignada correctamente.`,
      );
      setAssignModalVisible(false);
      await fetchPlayerSkills(selectedPlayerId);
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!selectedPlayerId || !skillToRemove) return;
    setRemoving(true);
    setError(null);
    setSuccess(null);
    try {
      await playerSkillService.removeSkill(
        selectedPlayerId,
        skillToRemove.skillId,
      );
      setSuccess(
        `Habilidad "${skillToRemove.skill?.name || `#${skillToRemove.skillId}`}" retirada del jugador. La habilidad sigue disponible en el catálogo.`,
      );
      setSkillToRemove(null);
      await fetchPlayerSkills(selectedPlayerId);
    } catch (err: any) {
      setSkillToRemove(null);
      setError(
        err?.message || "No fue posible retirar la habilidad del jugador.",
      );
    } finally {
      setRemoving(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando jugadores y habilidades..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Habilidades de Jugadores</h2>
        </div>
      </div>

      {error ? (
        <Alert type="danger" message={error} onClose={() => setError(null)} />
      ) : null}
      {success ? (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      ) : null}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link d-inline-flex align-items-center gap-2 ${activeTab === "BY_PLAYER" ? "active fw-semibold" : ""
              }`}
            onClick={() => {
              setActiveTab("BY_PLAYER");
              setError(null);
            }}
          >
            <CIcon icon={cilUser} size="sm" />
            <span>Por jugador</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link d-inline-flex align-items-center gap-2 ${activeTab === "BY_SKILL" ? "active fw-semibold" : ""
              }`}
            onClick={() => {
              setActiveTab("BY_SKILL");
              setError(null);
            }}
          >
            <CIcon icon={cilStar} size="sm" />
            <span>Por habilidad</span>
          </button>
        </li>
      </ul>

      {activeTab === "BY_PLAYER" ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-3 align-items-end mb-3">
              <div className="col-md-8">
                <label htmlFor="select-player-skills" className="form-label fw-semibold">
                  Seleccionar jugador
                </label>
                <select
                  id="select-player-skills"
                  className="form-select"
                  value={selectedPlayerId ?? ""}
                  onChange={(e) =>
                    setSelectedPlayerId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  disabled={players.length === 0}
                >
                  {players.length === 0 ? (
                    <option value="">No hay jugadores registrados</option>
                  ) : null}
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {formatPlayerName(player)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 d-grid d-md-flex justify-content-md-end">
                <button
                  type="button"
                  className="btn btn-sports-primary d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={
                    !selectedPlayer || !selectedPlayer.active || skills.length === 0
                  }
                  onClick={() => {
                    setSuccess(null);
                    setAssignModalVisible(true);
                  }}
                >
                  <CIcon icon={cilPlus} size="sm" />
                  <span>Asignar habilidad</span>
                </button>
              </div>
            </div>

            {selectedPlayer && !selectedPlayer.active ? (
              <Alert
                type="warning"
                message="Este jugador está inactivo. Puedes consultar su historial de habilidades, pero no es posible asignarle nuevas habilidades."
              />
            ) : null}

            {selectedPlayer ? (() => {
              const linkedUser = usersById.get(Number(selectedPlayer.userId));
              const isDeletedAccount = usersLoaded && !linkedUser;
              const isInactiveAccount = Boolean(linkedUser && linkedUser.active === false);
              return (
                <div
                  className={`d-flex flex-wrap align-items-center gap-3 mb-3 p-2 px-3 bg-light rounded border small ${
                    isDeletedAccount ? "border-danger" : ""
                  }`}
                >
                  <span>
                    <span className="text-body-secondary">Documento:</span>{" "}
                    <strong>{selectedPlayer.document}</strong>
                  </span>
                  <span>
                    <span className="text-body-secondary">Posición:</span>{" "}
                    <strong>{selectedPlayer.position || "Sin definir"}</strong>
                  </span>
                  {isDeletedAccount ? (
                    <CBadge color="danger" shape="rounded-pill">
                      Cuenta eliminada (ID #{selectedPlayer.userId})
                    </CBadge>
                  ) : isInactiveAccount ? (
                    <CBadge color="secondary" shape="rounded-pill">
                      Cuenta inactiva
                    </CBadge>
                  ) : null}
                  <span
                    className={`badge rounded-pill ms-auto ${
                      selectedPlayer.active ? "badge-sports" : "bg-secondary"
                    }`}
                  >
                    {selectedPlayer.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              );
            })() : null}

            <PlayerSkillsTable
              items={playerSkills}
              isLoading={loadingPlayerSkills}
              errorMessage={error || undefined}
              onRemove={(item) => setSkillToRemove(item)}
            />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-3 align-items-end mb-3">
              <div className="col-md-8">
                <label htmlFor="select-skill-players" className="form-label fw-semibold">
                  Seleccionar habilidad
                </label>
                <select
                  id="select-skill-players"
                  className="form-select"
                  value={selectedSkillId ?? ""}
                  onChange={(e) =>
                    setSelectedSkillId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  disabled={skills.length === 0}
                >
                  {skills.length === 0 ? (
                    <option value="">No hay habilidades registradas</option>
                  ) : null}
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 text-md-end">
                <span className="badge rounded-pill badge-sports px-3 py-2">
                  {skillPlayers ? skillPlayers.length : 0} jugador(es)
                </span>
              </div>
            </div>

            {selectedSkill ? (
              <div className="mb-3 p-2 bg-light rounded border small text-body-secondary">
                <strong className="text-body">{selectedSkill.name}:</strong>{" "}
                {selectedSkill.description}
              </div>
            ) : null}

            <SkillPlayersTable
              items={skillPlayers}
              usersById={usersById}
              usersLoaded={usersLoaded}
              isLoading={loadingSkillPlayers}
              errorMessage={error || undefined}
            />
          </div>
        </div>
      )}

      <AssignSkillModal
        visible={assignModalVisible}
        playerLabel={selectedPlayer ? formatPlayerName(selectedPlayer) : ""}
        skills={skills}
        assignedSkillIds={assignedSkillIds}
        submitting={assigning}
        onClose={() => setAssignModalVisible(false)}
        onSubmit={handleAssignSubmit}
      />

      <ConfirmModal
        visible={Boolean(skillToRemove)}
        title="Retirar habilidad"
        message={
          skillToRemove ? (
            <p className="mb-0">
              ¿Deseas retirar la habilidad{" "}
              <strong>
                {skillToRemove.skill?.name || `#${skillToRemove.skillId}`}
              </strong>{" "}
              de este jugador? La habilidad seguirá existiendo en el sistema.
            </p>
          ) : null
        }
        confirmLabel="Retirar"
        isLoading={removing}
        onConfirm={handleConfirmRemove}
        onCancel={() => setSkillToRemove(null)}
      />
    </div>
  );
}
