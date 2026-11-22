import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilReload, cilUserPlus } from "@coreui/icons";
import { Player, PlayerPayload, PlayerQueryFilters } from "../../models/Player";
import { User } from "../../models/User";
import { IPlayerService } from "../../services/interfaces/IPlayerService";
import { IUserService } from "../../services/interfaces/IUserService";
import { serviceContainer } from "../../services/serviceContainer";
import { SportsApiError } from "../../services/sportsHttp";
import Alert from "../../components/common/Alert";
import ConfirmModal from "../../components/common/ConfirmModal";
import PlayersTable from "./PlayersTable";
import PlayerFormModal from "./PlayerFormModal";
import PlayerDetailCard from "./PlayerDetailCard";

type StatusFilter = "ACTIVE" | "INACTIVE" | "ALL";

export interface PlayersPageProps {
  playerService?: IPlayerService;
  userService?: IUserService;
}

export default function PlayersPage({
  playerService = serviceContainer.playerService,
  userService = serviceContainer.userService,
}: PlayersPageProps) {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const hasLoadedPlayersRef = useRef<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [documentFilter, setDocumentFilter] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [appliedDocument, setAppliedDocument] = useState<string>("");
  const [appliedPosition, setAppliedPosition] = useState<string>("");

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState<Player | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const assignedUserIds = useMemo(() => {
    return new Set(allPlayers.map((p) => p.userId));
  }, [allPlayers]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const result = await userService.getAll();
    if (result) {
      setUsers(result);
    }
    setLoadingUsers(false);
  }, [userService]);

  const fetchAllPlayersIndex = useCallback(async () => {
    try {
      const result = await playerService.getAll({ all: true });
      setAllPlayers(result);
    } catch {
      // El error principal se reporta en fetchPlayers
    }
  }, [playerService]);

  const fetchPlayers = useCallback(
    async (showSpinner = false) => {
      if (showSpinner && !hasLoadedPlayersRef.current) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);

      const filters: PlayerQueryFilters = {};
      if (statusFilter === "ALL") {
        filters.all = true;
      } else if (statusFilter === "INACTIVE") {
        filters.active = false;
      }
      if (appliedDocument.trim()) {
        filters.document = appliedDocument.trim();
      }
      if (appliedPosition.trim()) {
        filters.position = appliedPosition.trim();
      }

      try {
        const result = await playerService.getAll(filters);
        hasLoadedPlayersRef.current = true;
        setPlayers(result);
        setSelectedPlayerId((currentId) => {
          if (currentId && result.some((p) => p.id === currentId)) {
            return currentId;
          }
          return result.length > 0 ? result[0].id : null;
        });
      } catch (err: any) {
        setError(err?.message || "No fue posible obtener la lista de jugadores.");
        if (!hasLoadedPlayersRef.current) {
          setPlayers(null);
        }
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [playerService, statusFilter, appliedDocument, appliedPosition],
  );

  const fetchPlayerDetail = useCallback(
    async (playerId: number | null) => {
      if (!playerId) {
        setSelectedPlayerDetail(null);
        setSelectedUserDetail(null);
        return;
      }

      setLoadingDetail(true);
      try {
        const detail = await playerService.getById(playerId);
        setSelectedPlayerDetail(detail);
        const userWithProfile = await userService.getDetailWithProfile(detail.userId);
        setSelectedUserDetail(userWithProfile ?? usersById.get(detail.userId) ?? null);
      } catch (err: any) {
        setError(err?.message || "No fue posible consultar el detalle del jugador.");
      } finally {
        setLoadingDetail(false);
      }
    },
    [playerService, userService, usersById],
  );

  useEffect(() => {
    fetchUsers();
    fetchAllPlayersIndex();
  }, [fetchUsers, fetchAllPlayersIndex]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedDocument(documentFilter);
      setAppliedPosition(positionFilter);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [documentFilter, positionFilter]);

  useEffect(() => {
    fetchPlayers(true);
  }, [fetchPlayers]);

  useEffect(() => {
    fetchPlayerDetail(selectedPlayerId);
  }, [selectedPlayerId, fetchPlayerDetail]);

  const handleClearFilters = () => {
    setStatusFilter("ACTIVE");
    setDocumentFilter("");
    setPositionFilter("");
    setAppliedDocument("");
    setAppliedPosition("");
  };

  const handleOpenCreate = () => {
    setPlayerToEdit(null);
    setFormModalVisible(true);
    setSuccess(null);
  };

  const handleOpenEdit = (player: Player) => {
    setPlayerToEdit(player);
    setFormModalVisible(true);
    setSuccess(null);
  };

  const handleFormSubmit = async (payload: PlayerPayload) => {
    setSubmittingForm(true);
    try {
      if (playerToEdit) {
        const updated = await playerService.update(playerToEdit.id, payload);
        setSuccess(`Jugador "${updated.document}" actualizado correctamente.`);
        setSelectedPlayerId(updated.id);
      } else {
        const created = await playerService.create(payload);
        setSuccess(`Jugador "${created.document}" registrado correctamente.`);
        setSelectedPlayerId(created.id);
      }
      setFormModalVisible(false);
      setPlayerToEdit(null);
      await Promise.all([fetchPlayers(false), fetchAllPlayersIndex()]);
      if (playerToEdit) {
        await fetchPlayerDetail(playerToEdit.id);
      }
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (player: Player) => {
    setError(null);
    setSuccess(null);
    try {
      if (player.active) {
        await playerService.deactivate(player.id);
        setSuccess(`Jugador "${player.document}" desactivado correctamente.`);
      } else {
        await playerService.activate(player.id);
        setSuccess(`Jugador "${player.document}" activado correctamente.`);
      }
      await Promise.all([fetchPlayers(false), fetchAllPlayersIndex()]);
      if (selectedPlayerId === player.id) {
        await fetchPlayerDetail(player.id);
      }
    } catch (err: any) {
      setError(err?.message || "No fue posible cambiar el estado del jugador.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await playerService.remove(playerToDelete.id);
      setSuccess(`Jugador "${playerToDelete.document}" eliminado correctamente.`);
      const deletedId = playerToDelete.id;
      setPlayerToDelete(null);
      if (selectedPlayerId === deletedId) {
        setSelectedPlayerId(null);
      }
      await Promise.all([fetchPlayers(false), fetchAllPlayersIndex()]);
    } catch (err: any) {
      setPlayerToDelete(null);
      if (err instanceof SportsApiError && err.status === 409) {
        setError(
          `${err.message} Puedes desactivar el jugador para conservar su historial.`,
        );
      } else {
        setError(err?.message || "No fue posible eliminar el jugador.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = useMemo(
    () => allPlayers.filter((p) => p.active).length,
    [allPlayers],
  );
  const inactiveCount = allPlayers.length - activeCount;

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Gestión de Jugadores</h2>
        </div>
        <button
          type="button"
          className="btn btn-sports-primary d-inline-flex align-items-center gap-2"
          onClick={handleOpenCreate}
        >
          <CIcon icon={cilUserPlus} size="sm" />
          <span>Nuevo jugador</span>
        </button>
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

      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <div className="card shadow-sm border-0">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">Total registrados</span>
              <span className="fs-5 fw-bold">{allPlayers.length}</span>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card shadow-sm border-0">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">Activos</span>
              <span className="fs-5 fw-bold text-success">{activeCount}</span>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card shadow-sm border-0">
            <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">Inactivos</span>
              <span className="fs-5 fw-bold text-secondary">{inactiveCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label htmlFor="players-status-filter" className="form-label small mb-1">
                Estado
              </label>
              <select
                id="players-status-filter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="ACTIVE">Solo activos</option>
                <option value="INACTIVE">Solo inactivos</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="players-document-filter" className="form-label small mb-1">
                Documento
              </label>
              <input
                id="players-document-filter"
                type="text"
                className="form-control"
                placeholder="Buscar por documento..."
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="players-position-filter" className="form-label small mb-1">
                Posición
              </label>
              <input
                id="players-position-filter"
                type="text"
                className="form-control"
                placeholder="Buscar por posición..."
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              />
            </div>
            <div className="col-md-1 d-grid">
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                title="Limpiar filtros"
                aria-label="Limpiar filtros"
                onClick={handleClearFilters}
              >
                <CIcon icon={cilReload} size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">Listado de jugadores</span>
                {isFiltering ? (
                  <div
                    className="spinner-border spinner-border-sm text-success"
                    role="status"
                    aria-label="Actualizando resultados"
                  />
                ) : null}
              </div>
              <span className="badge rounded-pill badge-sports">
                {players ? players.length : 0} resultado(s)
              </span>
            </div>
            <div className="card-body">
              <PlayersTable
                players={players}
                usersById={usersById}
                isLoading={isLoading}
                errorMessage={error || undefined}
                selectedPlayerId={selectedPlayerId}
                onSelect={(player) => setSelectedPlayerId(player.id)}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={(player) => setPlayerToDelete(player)}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <PlayerDetailCard
            playerDetail={selectedPlayerDetail}
            userDetail={selectedUserDetail}
            loadingDetail={loadingDetail}
            onEditPlayer={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onDeletePlayer={(player) => setPlayerToDelete(player)}
          />
        </div>
      </div>

      <PlayerFormModal
        visible={formModalVisible}
        playerToEdit={playerToEdit}
        users={users}
        assignedUserIds={assignedUserIds}
        loadingUsers={loadingUsers}
        submitting={submittingForm}
        onClose={() => {
          setFormModalVisible(false);
          setPlayerToEdit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        visible={Boolean(playerToDelete)}
        title="Eliminar jugador"
        message={
          playerToDelete ? (
            <p className="mb-0">
              ¿Estás seguro de eliminar al jugador con documento{" "}
              <strong>{playerToDelete.document}</strong>? Esta acción no se puede
              deshacer.
            </p>
          ) : null
        }
        confirmLabel="Eliminar"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPlayerToDelete(null)}
      />
    </div>
  );
}
