import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilReload } from "@coreui/icons";
import { Player, PlayerQueryFilters } from "../../models/Player";
import { PlayerProfile } from "../../models/PlayerProfile";
import { User } from "../../models/User";
import { IPlayerService } from "../../services/interfaces/IPlayerService";
import { IPlayerProfileService } from "../../services/interfaces/IPlayerProfileService";
import { IUserService } from "../../services/interfaces/IUserService";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import PlayerProfileCard from "./PlayerProfileCard";
import ProfileTeamsCard from "./ProfileTeamsCard";
import ProfileSkillsCard from "./ProfileSkillsCard";

export interface PlayerProfilePageProps {
  playerService?: IPlayerService;
  playerProfileService?: IPlayerProfileService;
  userService?: IUserService;
}

export default function PlayerProfilePage({
  playerService = serviceContainer.playerService,
  playerProfileService = serviceContainer.playerProfileService,
  userService = serviceContainer.userService,
}: PlayerProfilePageProps) {
  const { id: routeIdParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const hasLoadedListRef = useRef<boolean>(false);

  const [documentFilter, setDocumentFilter] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [appliedDocument, setAppliedDocument] = useState<string>("");
  const [appliedPosition, setAppliedPosition] = useState<string>("");

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(() => {
    if (routeIdParam) {
      const parsed = Number(routeIdParam);
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
    }
    return null;
  });

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((u) => map.set(Number(u.id), u));
    return map;
  }, [users]);

  useEffect(() => {
    if (routeIdParam) {
      const parsed = Number(routeIdParam);
      if (Number.isInteger(parsed) && parsed > 0) {
        setSelectedPlayerId(parsed);
      }
    }
  }, [routeIdParam]);

  useEffect(() => {
    let active = true;
    userService
      .getUsersForSelector()
      .then((result) => {
        if (active && result) {
          setUsers(result);
          setUsersLoaded(true);
        }
      })
      .catch(() => {
        // Sin acceso al selector de usuarios, se mantiene fallback por ID
      });
    return () => {
      active = false;
    };
  }, [userService]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedDocument(documentFilter);
      setAppliedPosition(positionFilter);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [documentFilter, positionFilter]);

  const fetchPlayers = useCallback(async () => {
    if (!hasLoadedListRef.current) {
      setLoadingList(true);
    } else {
      setIsSearching(true);
    }

    const filters: PlayerQueryFilters = { all: true };
    if (appliedDocument.trim()) {
      filters.document = appliedDocument.trim();
    }
    if (appliedPosition.trim()) {
      filters.position = appliedPosition.trim();
    }

    try {
      const result = await playerService.getAll(filters);
      hasLoadedListRef.current = true;
      setPlayers(result);
      setSelectedPlayerId((currentId) => {
        if (currentId && result.some((p) => p.id === currentId)) {
          return currentId;
        }
        if (routeIdParam) {
          const parsed = Number(routeIdParam);
          if (Number.isInteger(parsed) && parsed > 0) return parsed;
        }
        return result.length > 0 ? result[0].id : null;
      });
    } catch (err: any) {
      setError(err?.message || "No fue posible buscar los jugadores registrados.");
    } finally {
      setLoadingList(false);
      setIsSearching(false);
    }
  }, [playerService, appliedDocument, appliedPosition, routeIdParam]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const fetchProfile = useCallback(
    async (playerId: number | null) => {
      if (!playerId) {
        setProfile(null);
        setUserDetail(null);
        return;
      }

      setLoadingProfile(true);
      setError(null);
      try {
        const result = await playerProfileService.getByPlayerId(playerId);
        setProfile(result);

        const detail = await userService.getDetailWithProfile(
          result.player.userId,
        );
        setUserDetail(detail ?? usersById.get(Number(result.player.userId)) ?? null);
      } catch (err: any) {
        setProfile(null);
        setUserDetail(null);
        setError(
          err?.message || "No fue posible consultar el perfil deportivo del jugador.",
        );
      } finally {
        setLoadingProfile(false);
      }
    },
    [playerProfileService, userService, usersById],
  );

  useEffect(() => {
    fetchProfile(selectedPlayerId);
  }, [selectedPlayerId, fetchProfile]);

  const handleSelectPlayer = (playerId: number) => {
    setSelectedPlayerId(playerId);
    if (routeIdParam) {
      navigate(`/player-profile/${playerId}`, { replace: true });
    }
  };

  const handleClearSearch = () => {
    setDocumentFilter("");
    setPositionFilter("");
    setAppliedDocument("");
    setAppliedPosition("");
  };

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="mb-3">
        <h2 className="mb-0 fw-bold">Perfil Deportivo del Jugador</h2>
      </div>

      {error ? (
        <Alert type="danger" message={error} onClose={() => setError(null)} />
      ) : null}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="profile-player-select" className="form-label small mb-0">
                  Seleccionar jugador
                </label>
                <div className="d-flex align-items-center gap-2">
                  {isSearching ? (
                    <div
                      className="spinner-border spinner-border-sm text-success"
                      role="status"
                    />
                  ) : null}
                  <span className="badge rounded-pill badge-sports">
                    {players.length}
                  </span>
                </div>
              </div>
              <select
                id="profile-player-select"
                className="form-select"
                value={selectedPlayerId ?? ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > 0) handleSelectPlayer(value);
                }}
                disabled={loadingList || players.length === 0}
              >
                {loadingList ? (
                  <option value="">Cargando jugadores...</option>
                ) : players.length === 0 ? (
                  <option value="">Sin jugadores coincidentes</option>
                ) : null}
                {players.map((player) => {
                  const user = usersById.get(Number(player.userId));
                  const label = user
                    ? user.name || `Usuario #${player.userId}`
                    : usersLoaded
                      ? `Cuenta eliminada (ID #${player.userId})`
                      : `Usuario #${player.userId}`;
                  return (
                    <option key={player.id} value={player.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="profile-doc-search" className="form-label small mb-1">
                Buscar por documento
              </label>
              <input
                id="profile-doc-search"
                type="text"
                className="form-control"
                placeholder="Ej. CC-1053..."
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="profile-pos-search" className="form-label small mb-1">
                Buscar por posición
              </label>
              <input
                id="profile-pos-search"
                type="text"
                className="form-control"
                placeholder="Ej. Delantero..."
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              />
            </div>
            <div className="col-md-1 d-grid">
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
                onClick={handleClearSearch}
              >
                <CIcon icon={cilReload} size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loadingList || loadingProfile ? (
        <div className="card shadow-sm">
          <div className="card-body py-5">
            <Loader text="Cargando perfil deportivo..." />
          </div>
        </div>
      ) : !profile ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5 text-body-secondary">
            {players.length === 0
              ? "No se encontraron jugadores con los filtros ingresados."
              : "Selecciona un jugador para consultar su perfil deportivo completo."}
          </div>
        </div>
      ) : (
        <>
          <PlayerProfileCard
            player={profile.player}
            userDetail={userDetail}
            usersLoaded={usersLoaded}
          />
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileTeamsCard
                teams={profile.teams}
                teamsMessage={profile.teamsMessage}
              />
            </div>
            <div className="col-md-6">
              <ProfileSkillsCard
                skills={profile.skills}
                skillsMessage={profile.skillsMessage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
