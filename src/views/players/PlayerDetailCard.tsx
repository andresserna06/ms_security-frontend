import React from "react";
import CIcon from "@coreui/icons-react";
import { cilBan, cilCheckCircle, cilPencil, cilTrash } from "@coreui/icons";
import { Player } from "../../models/Player";
import { User } from "../../models/User";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";

export interface PlayerDetailCardProps {
  playerDetail: Player | null;
  userDetail: User | null;
  loadingDetail: boolean;
  onEditPlayer: (player: Player) => void;
  onToggleStatus: (player: Player) => void;
  onDeletePlayer: (player: Player) => void;
}

export default function PlayerDetailCard({
  playerDetail,
  userDetail,
  loadingDetail,
  onEditPlayer,
  onToggleStatus,
  onDeletePlayer,
}: PlayerDetailCardProps) {
  if (!playerDetail && loadingDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del jugador</div>
        <div className="card-body py-5">
          <Loader text="Cargando detalle del jugador..." />
        </div>
      </div>
    );
  }

  if (!playerDetail) {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-header fw-semibold">Detalle del jugador</div>
        <div className="card-body text-center py-5 text-body-secondary">
          <p className="mb-0">
            Selecciona un jugador de la tabla para consultar su ficha deportiva y
            gestionar su información o estado.
          </p>
        </div>
      </div>
    );
  }

  const displayName = userDetail?.name || `Usuario #${playerDetail.userId}`;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Detalle del jugador</span>
        <div className="d-flex align-items-center gap-2">
          {loadingDetail ? (
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            />
          ) : null}
          <span className="badge rounded-pill badge-sports">
            Jugador #{playerDetail.id}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
              style={{
                width: "52px",
                height: "52px",
                fontSize: "1.05rem",
                backgroundColor: "#70B038",
              }}
            >
              {userDetail?.profile?.photo ? (
                <img
                  src={userDetail.profile.photo}
                  alt={displayName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span>{initials || "J"}</span>
              )}
            </div>
            <div>
              <h5 className="mb-1 fw-bold">{displayName}</h5>
              <div className="text-body-secondary small">
                {userDetail?.email || `Usuario ID #${playerDetail.userId}`}
              </div>
            </div>
          </div>

          <span
            className={`badge rounded-pill ${
              playerDetail.active ? "badge-sports" : "bg-secondary"
            }`}
          >
            {playerDetail.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <ul className="list-group list-group-flush border-top border-bottom mb-3">
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Documento</span>
            <span className="fw-semibold small">{playerDetail.document}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Posición</span>
            <span className="fw-semibold small">
              {playerDetail.position || (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Dorsal</span>
            <span className="fw-semibold small">
              {playerDetail.jerseyNumber !== null &&
              playerDetail.jerseyNumber !== undefined ? (
                `#${playerDetail.jerseyNumber}`
              ) : (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">ID Usuario (Seguridad)</span>
            <span className="fw-semibold small">#{playerDetail.userId}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Fecha de nacimiento</span>
            <span className="fw-semibold small">
              {userDetail?.profile?.birthDate || (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </span>
          </li>
          <li className="list-group-item d-flex justify-content-between px-0 py-2">
            <span className="text-body-secondary small">Ciudad</span>
            <span className="fw-semibold small">
              {userDetail?.profile?.city || (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </span>
          </li>
        </ul>

        <div className="row g-2 mb-3">
          <div className="col-12">
            <button
              type="button"
              className="btn btn-sm btn-sports-edit w-100 d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => onEditPlayer(playerDetail)}
            >
              <CIcon icon={cilPencil} size="sm" />
              <span>Editar jugador</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className={`btn btn-sm w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 ${
                playerDetail.active
                  ? "btn-sports-deactivate"
                  : "btn-sports-primary"
              }`}
              onClick={() => onToggleStatus(playerDetail)}
            >
              <CIcon
                icon={playerDetail.active ? cilBan : cilCheckCircle}
                size="sm"
              />
              <span>{playerDetail.active ? "Desactivar" : "Activar"}</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn btn-sm btn-danger text-white w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => onDeletePlayer(playerDetail)}
            >
              <CIcon icon={cilTrash} size="sm" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        <Alert
          type="info"
          message="Si el jugador tiene contratos, habilidades o anotaciones asociadas, no podrá eliminarse; en ese caso puedes desactivarlo."
        />
      </div>
    </div>
  );
}
