import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CBadge } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPeople, cilPlus, cilUser } from "@coreui/icons";
import { Player } from "../../models/Player";
import { Team } from "../../models/Team";
import {
  CreatePlayerContractPayload,
  PlayerTeamContract,
  TeamPlayerContract,
} from "../../models/PlayerContract";
import { User } from "../../models/User";
import { ITeamService } from "../../services/interfaces/ITeamService";
import { IPlayerService } from "../../services/interfaces/IPlayerService";
import { IPlayerContractService } from "../../services/interfaces/IPlayerContractService";
import { IUserService } from "../../services/interfaces/IUserService";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import TeamPlayersTable from "./TeamPlayersTable";
import PlayerTeamsTable from "./PlayerTeamsTable";
import ContractFormModal from "./ContractFormModal";

type ActiveTab = "BY_TEAM" | "BY_PLAYER";
type CurrentFilter = "ALL" | "CURRENT" | "ENDED";

export interface ContractsPageProps {
  teamService?: ITeamService;
  playerService?: IPlayerService;
  playerContractService?: IPlayerContractService;
  userService?: IUserService;
}

export default function ContractsPage({
  teamService = serviceContainer.teamService,
  playerService = serviceContainer.playerService,
  playerContractService = serviceContainer.playerContractService,
  userService = serviceContainer.userService,
}: ContractsPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("BY_TEAM");

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState<boolean>(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamFilter, setTeamFilter] = useState<CurrentFilter>("CURRENT");
  const [teamContracts, setTeamContracts] = useState<TeamPlayerContract[] | null>(
    null,
  );
  const [loadingTeamContracts, setLoadingTeamContracts] = useState<boolean>(false);

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerFilter, setPlayerFilter] = useState<CurrentFilter>("ALL");
  const [playerContracts, setPlayerContracts] = useState<
    PlayerTeamContract[] | null
  >(null);
  const [loadingPlayerContracts, setLoadingPlayerContracts] =
    useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [creatingContract, setCreatingContract] = useState<boolean>(false);

  const [contractToEnd, setContractToEnd] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [endingContract, setEndingContract] = useState<boolean>(false);

  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((u) => map.set(Number(u.id), u));
    return map;
  }, [users]);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId],
  );

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
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

  const mapFilterToParam = (filter: CurrentFilter): boolean | undefined => {
    if (filter === "CURRENT") return true;
    if (filter === "ENDED") return false;
    return undefined;
  };

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setError(null);
    try {
      const [allTeams, allPlayers, allUsers] = await Promise.all([
        teamService.getAll(),
        playerService.getAll({ all: true }),
        userService.getAll(),
      ]);
      setTeams(allTeams);
      setPlayers(allPlayers);
      if (allUsers) {
        setUsers(allUsers);
        setUsersLoaded(true);
      }
      if (allTeams.length > 0) {
        setSelectedTeamId((prev) =>
          prev && allTeams.some((t) => t.id === prev) ? prev : allTeams[0].id,
        );
      }
      if (allPlayers.length > 0) {
        setSelectedPlayerId((prev) =>
          prev && allPlayers.some((p) => p.id === prev) ? prev : allPlayers[0].id,
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
        "No fue posible cargar los catálogos de equipos y jugadores.",
      );
    } finally {
      setLoadingCatalogs(false);
    }
  }, [teamService, playerService, userService]);

  const fetchTeamContracts = useCallback(
    async (teamId: number | null, filter: CurrentFilter) => {
      if (!teamId) {
        setTeamContracts([]);
        return;
      }
      setLoadingTeamContracts(true);
      setError(null);
      try {
        const result = await playerContractService.getTeamPlayers(
          teamId,
          mapFilterToParam(filter),
        );
        setTeamContracts(result);
      } catch (err: any) {
        setError(
          err?.message || "No fue posible obtener los contratos del equipo.",
        );
        setTeamContracts(null);
      } finally {
        setLoadingTeamContracts(false);
      }
    },
    [playerContractService],
  );

  const fetchPlayerContracts = useCallback(
    async (playerId: number | null, filter: CurrentFilter) => {
      if (!playerId) {
        setPlayerContracts([]);
        return;
      }
      setLoadingPlayerContracts(true);
      setError(null);
      try {
        const result = await playerContractService.getPlayerTeams(
          playerId,
          mapFilterToParam(filter),
        );
        setPlayerContracts(result);
      } catch (err: any) {
        setError(
          err?.message ||
          "No fue posible obtener el historial de equipos del jugador.",
        );
        setPlayerContracts(null);
      } finally {
        setLoadingPlayerContracts(false);
      }
    },
    [playerContractService],
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    if (activeTab === "BY_TEAM") {
      fetchTeamContracts(selectedTeamId, teamFilter);
    }
  }, [activeTab, selectedTeamId, teamFilter, fetchTeamContracts]);

  useEffect(() => {
    if (activeTab === "BY_PLAYER") {
      fetchPlayerContracts(selectedPlayerId, playerFilter);
    }
  }, [activeTab, selectedPlayerId, playerFilter, fetchPlayerContracts]);

  const handleCreateContract = async (payload: CreatePlayerContractPayload) => {
    if (!selectedTeamId) return;
    setCreatingContract(true);
    try {
      await playerContractService.create(selectedTeamId, payload);
      setSuccess("Contrato registrado correctamente.");
      setFormModalVisible(false);
      await fetchTeamContracts(selectedTeamId, teamFilter);
    } finally {
      setCreatingContract(false);
    }
  };

  const handleConfirmEndContract = async () => {
    if (!contractToEnd) return;
    setEndingContract(true);
    setError(null);
    setSuccess(null);
    try {
      await playerContractService.endContract(contractToEnd.id);
      setSuccess(
        `Contrato finalizado correctamente (${contractToEnd.label}). El historial se conserva y el jugador queda disponible para nuevos traspasos.`,
      );
      setContractToEnd(null);
      if (activeTab === "BY_TEAM") {
        await fetchTeamContracts(selectedTeamId, teamFilter);
      } else {
        await fetchPlayerContracts(selectedPlayerId, playerFilter);
      }
    } catch (err: any) {
      setContractToEnd(null);
      setError(err?.message || "No fue posible finalizar el contrato.");
    } finally {
      setEndingContract(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando equipos y jugadores..." />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Contratos Jugador–Equipo</h2>
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
            className={`nav-link d-inline-flex align-items-center gap-2 ${activeTab === "BY_TEAM" ? "active fw-semibold" : ""
              }`}
            onClick={() => {
              setActiveTab("BY_TEAM");
              setError(null);
            }}
          >
            <CIcon icon={cilPeople} size="sm" />
            <span>Por equipo</span>
          </button>
        </li>
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
            <span>Por jugador (Historial)</span>
          </button>
        </li>
      </ul>

      {activeTab === "BY_TEAM" ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-3 align-items-end mb-3">
              <div className="col-md-5">
                <label htmlFor="select-team-contracts" className="form-label fw-semibold">
                  Seleccionar equipo
                </label>
                <select
                  id="select-team-contracts"
                  className="form-select"
                  value={selectedTeamId ?? ""}
                  onChange={(e) =>
                    setSelectedTeamId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  disabled={teams.length === 0}
                >
                  {teams.length === 0 ? (
                    <option value="">No hay equipos registrados</option>
                  ) : null}
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="filter-team-contracts" className="form-label fw-semibold">
                  Vigencia
                </label>
                <select
                  id="filter-team-contracts"
                  className="form-select"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value as CurrentFilter)}
                >
                  <option value="CURRENT">Solo vigentes</option>
                  <option value="ALL">Todos (vigentes e históricos)</option>
                  <option value="ENDED">Solo finalizados</option>
                </select>
              </div>
              <div className="col-md-4 d-grid d-md-flex justify-content-md-end">
                <button
                  type="button"
                  className="btn btn-sports-primary d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={!selectedTeam || !selectedTeam.active}
                  onClick={() => {
                    setSuccess(null);
                    setFormModalVisible(true);
                  }}
                >
                  <CIcon icon={cilPlus} size="sm" />
                  <span>Nuevo contrato</span>
                </button>
              </div>
            </div>

            {selectedTeam && !selectedTeam.active ? (
              <Alert
                type="warning"
                message="Este equipo está inactivo. Puedes consultar su historial de contratos, pero no es posible registrar nuevos contratos."
              />
            ) : null}

            <TeamPlayersTable
              contracts={teamContracts}
              usersById={usersById}
              usersLoaded={usersLoaded}
              isLoading={loadingTeamContracts}
              errorMessage={error || undefined}
              onEndContract={(contract) => {
                const user = contract.player
                  ? usersById.get(Number(contract.player.userId))
                  : undefined;
                const playerName =
                  user?.name || contract.player?.document || `#${contract.playerId}`;
                setContractToEnd({
                  id: contract.id,
                  label: `${playerName} en ${selectedTeam?.name || "el equipo"}`,
                });
              }}
            />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-3 align-items-end mb-3">
              <div className="col-md-8">
                <label htmlFor="select-player-contracts" className="form-label fw-semibold">
                  Seleccionar jugador
                </label>
                <select
                  id="select-player-contracts"
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
              <div className="col-md-4">
                <label htmlFor="filter-player-contracts" className="form-label fw-semibold">
                  Vigencia
                </label>
                <select
                  id="filter-player-contracts"
                  className="form-select"
                  value={playerFilter}
                  onChange={(e) =>
                    setPlayerFilter(e.target.value as CurrentFilter)
                  }
                >
                  <option value="ALL">Todos (historial completo)</option>
                  <option value="CURRENT">Solo vigentes</option>
                  <option value="ENDED">Solo finalizados</option>
                </select>
              </div>
            </div>

            {selectedPlayer ? (() => {
              const linkedUser = usersById.get(Number(selectedPlayer.userId));
              const isDeletedAccount = usersLoaded && !linkedUser;
              const isInactiveAccount = Boolean(linkedUser && linkedUser.active === false);
              return (
                <div
                  className={`d-flex flex-wrap align-items-center gap-3 mb-3 p-2 px-3 bg-light rounded border small ${isDeletedAccount ? "border-danger" : ""
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
                    className={`badge rounded-pill ms-auto ${selectedPlayer.active ? "badge-sports" : "bg-secondary"
                      }`}
                  >
                    {selectedPlayer.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              );
            })() : null}

            <PlayerTeamsTable
              contracts={playerContracts}
              isLoading={loadingPlayerContracts}
              errorMessage={error || undefined}
              onEndContract={(contract) =>
                setContractToEnd({
                  id: contract.id,
                  label: `${contract.team?.name || `Equipo #${contract.teamId}`}`,
                })
              }
            />
          </div>
        </div>
      )}

      <ContractFormModal
        visible={formModalVisible}
        teamName={selectedTeam ? `${selectedTeam.name} (${selectedTeam.city})` : ""}
        players={players}
        usersById={usersById}
        submitting={creatingContract}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleCreateContract}
      />

      <ConfirmModal
        visible={Boolean(contractToEnd)}
        title="Finalizar contrato"
        message={
          contractToEnd ? (
            <p className="mb-0">
              ¿Deseas finalizar el contrato de{" "}
              <strong>{contractToEnd.label}</strong> con fecha de hoy? El registro
              se conservará en el historial de traspasos.
            </p>
          ) : null
        }
        confirmLabel="Finalizar contrato"
        isLoading={endingContract}
        onConfirm={handleConfirmEndContract}
        onCancel={() => setContractToEnd(null)}
      />
    </div>
  );
}
