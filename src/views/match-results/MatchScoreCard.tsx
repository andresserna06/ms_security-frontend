import React, { useEffect, useState } from "react";
import { CBadge } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCheckCircle, cilSave } from "@coreui/icons";
import {
  FinishMatchPayload,
  Match,
  MatchStatus,
  UpdateMatchResultPayload,
} from "../../models/Match";

export interface MatchScoreCardProps {
  match: Match;
  homeTeamName: string;
  awayTeamName: string;
  isBlocked: boolean;
  savingResult: boolean;
  finishingMatch: boolean;
  onSaveResult: (payload: UpdateMatchResultPayload) => Promise<void>;
  onRequestFinish: (payload: FinishMatchPayload) => void;
}

const STATUS_META: Record<
  MatchStatus,
  { label: string; color: "info" | "primary" | "success" | "danger" | "secondary" }
> = {
  SCHEDULED: { label: "Programado", color: "info" },
  IN_PROGRESS: { label: "En curso", color: "primary" },
  FINISHED: { label: "Finalizado", color: "success" },
  CANCELLED: { label: "Cancelado", color: "danger" },
};

function formatMatchDate(iso: string): string {
  if (!iso) return "Sin fecha";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchScoreCard({
  match,
  homeTeamName,
  awayTeamName,
  isBlocked,
  savingResult,
  finishingMatch,
  onSaveResult,
  onRequestFinish,
}: MatchScoreCardProps) {
  const [homeScore, setHomeScore] = useState<string>(
    match.homeScore !== null && match.homeScore !== undefined
      ? String(match.homeScore)
      : "0",
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.awayScore !== null && match.awayScore !== undefined
      ? String(match.awayScore)
      : "0",
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setHomeScore(
      match.homeScore !== null && match.homeScore !== undefined
        ? String(match.homeScore)
        : "0",
    );
    setAwayScore(
      match.awayScore !== null && match.awayScore !== undefined
        ? String(match.awayScore)
        : "0",
    );
    setValidationError(null);
  }, [match.id, match.homeScore, match.awayScore]);

  const parseScores = (): UpdateMatchResultPayload | null => {
    const h = Number(homeScore);
    const a = Number(awayScore);
    if (
      homeScore.trim() === "" ||
      awayScore.trim() === "" ||
      !Number.isInteger(h) ||
      !Number.isInteger(a) ||
      h < 0 ||
      a < 0
    ) {
      setValidationError(
        "Los marcadores local y visitante deben ser números enteros mayores o iguales a 0.",
      );
      return null;
    }
    setValidationError(null);
    return { homeScore: h, awayScore: a };
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = parseScores();
    if (!parsed) return;
    await onSaveResult(parsed);
  };

  const handleFinishClick = () => {
    const parsed = parseScores();
    if (!parsed) return;
    onRequestFinish(parsed);
  };

  const statusInfo = STATUS_META[match.status] ?? {
    label: match.status,
    color: "secondary" as const,
  };
  const canFinish =
    !isBlocked &&
    match.status !== "FINISHED" &&
    match.status !== "CANCELLED";

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold">Marcador del partido #{match.id}</span>
          <span className="text-body-secondary small">
            • {formatMatchDate(match.scheduledAt)}
          </span>
        </div>
        <CBadge color={statusInfo.color} shape="rounded-pill">
          {statusInfo.label}
        </CBadge>
      </div>

      <div className="card-body">
        <form onSubmit={handleSave} noValidate>
          <div className="row g-3 align-items-center justify-content-center text-center mb-3">
            <div className="col-12 col-md-4">
              <div className="text-body-secondary small text-uppercase mb-1">
                Local
              </div>
              <div className="fw-bold fs-5 mb-2">{homeTeamName}</div>
              <input
                type="number"
                min={0}
                step={1}
                className="form-control form-control-lg text-center fw-bold mx-auto"
                style={{ maxWidth: "110px" }}
                aria-label="Marcador local"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                disabled={isBlocked || savingResult || finishingMatch}
              />
            </div>

            <div className="col-12 col-md-2">
              <span className="fs-4 fw-bold text-body-secondary">VS</span>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-body-secondary small text-uppercase mb-1">
                Visitante
              </div>
              <div className="fw-bold fs-5 mb-2">{awayTeamName}</div>
              <input
                type="number"
                min={0}
                step={1}
                className="form-control form-control-lg text-center fw-bold mx-auto"
                style={{ maxWidth: "110px" }}
                aria-label="Marcador visitante"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                disabled={isBlocked || savingResult || finishingMatch}
              />
            </div>
          </div>

          {validationError ? (
            <div className="text-danger small text-center mb-3">
              {validationError}
            </div>
          ) : null}

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <button
              type="submit"
              className="btn btn-sports-primary d-inline-flex align-items-center gap-2"
              disabled={isBlocked || savingResult || finishingMatch}
            >
              <CIcon icon={cilSave} size="sm" />
              <span>
                {savingResult ? "Guardando..." : "Guardar resultado"}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-sports-deactivate d-inline-flex align-items-center gap-2"
              disabled={!canFinish || savingResult || finishingMatch}
              onClick={handleFinishClick}
            >
              <CIcon icon={cilCheckCircle} size="sm" />
              <span>
                {finishingMatch
                  ? "Finalizando..."
                  : match.status === "FINISHED"
                  ? "Partido finalizado"
                  : "Finalizar partido"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
