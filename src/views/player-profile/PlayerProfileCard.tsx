import React from "react";
import { Player } from "../../models/Player";
import { User } from "../../models/User";

export interface PlayerProfileCardProps {
  player: Player;
  userDetail: User | null;
}

export default function PlayerProfileCard({
  player,
  userDetail,
}: PlayerProfileCardProps) {
  const displayName = userDetail?.name || `Usuario #${player.userId}`;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Información básica del jugador</span>
        <span
          className={`badge rounded-pill ${
            player.active ? "badge-sports" : "bg-secondary"
          }`}
        >
          {player.active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <div
            className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
            style={{
              width: "64px",
              height: "64px",
              fontSize: "1.25rem",
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
          <div className="flex-grow-1">
            <h4 className="mb-1 fw-bold">{displayName}</h4>
            <div className="text-body-secondary small">
              {userDetail?.email || `ID de usuario: #${player.userId}`}
            </div>
          </div>
          {player.jerseyNumber !== null && player.jerseyNumber !== undefined ? (
            <div className="text-center px-3 py-2 bg-light rounded border">
              <div className="text-body-secondary small">Dorsal</div>
              <div className="fs-4 fw-bold">#{player.jerseyNumber}</div>
            </div>
          ) : null}
        </div>

        <div className="row g-3 border-top pt-2">
          <div className="col-sm-6 col-md-4">
            <div className="text-body-secondary small">Documento</div>
            <div className="fw-semibold">{player.document}</div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="text-body-secondary small">Posición</div>
            <div className="fw-semibold">
              {player.position || (
                <span className="text-body-secondary fst-italic">Sin definir</span>
              )}
            </div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="text-body-secondary small">Fecha de nacimiento</div>
            <div className="fw-semibold">
              {userDetail?.profile?.birthDate || (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="text-body-secondary small">Ciudad</div>
            <div className="fw-semibold">
              {userDetail?.profile?.city || (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="text-body-secondary small">Teléfono</div>
            <div className="fw-semibold">
              {userDetail?.profile?.phone || (
                <span className="text-body-secondary fst-italic">
                  Sin registrar
                </span>
              )}
            </div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="text-body-secondary small">ID Jugador</div>
            <div className="fw-semibold">#{player.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
