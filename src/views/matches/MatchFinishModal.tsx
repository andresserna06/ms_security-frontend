import React, { useEffect, useState } from "react";
import { Match } from "../../models/Match";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

interface MatchFinishModalProps {
  visible: boolean;
  match: Match | null;
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: { homeScore: number; awayScore: number }) => Promise<void>;
}

export default function MatchFinishModal({
  visible,
  match,
  submitting,
  error,
  onClose,
  onSubmit,
}: MatchFinishModalProps) {
  const [homeScore, setHomeScore] = useState<string>("0");
  const [awayScore, setAwayScore] = useState<string>("0");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setHomeScore(match?.homeScore !== null && match?.homeScore !== undefined ? String(match.homeScore) : "0");
      setAwayScore(match?.awayScore !== null && match?.awayScore !== undefined ? String(match.awayScore) : "0");
      setLocalError(null);
    }
  }, [visible, match]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (!Number.isInteger(home) || home < 0 || !Number.isInteger(away) || away < 0) {
      setLocalError("Los marcadores deben ser números enteros desde 0.");
      return;
    }
    setLocalError(null);
    await onSubmit({ homeScore: home, awayScore: away });
  };

  return (
    <GenericModal
      visible={visible}
      title="Finalizar partido"
      onClose={submitting ? () => {} : onClose}
      backdrop={submitting ? "static" : true}
      size="sm"
      footer={
        <>
          <GenericButton label="Cancelar" variant="secondary" onClick={onClose} disabled={submitting} />
          <button type="submit" form="match-finish-form" className="btn btn-sports-primary" disabled={submitting}>
            {submitting ? "Guardando..." : "Finalizar"}
          </button>
        </>
      }
    >
      <form id="match-finish-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert type="danger" message={error} onClose={() => {}} /> : null}
        {localError ? <Alert type="danger" message={localError} onClose={() => setLocalError(null)} /> : null}
        <div className="row g-3">
          <div className="col-6">
            <label htmlFor="finish-home-score" className="form-label">Local</label>
            <input
              id="finish-home-score"
              type="number"
              min={0}
              className="form-control"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="col-6">
            <label htmlFor="finish-away-score" className="form-label">Visitante</label>
            <input
              id="finish-away-score"
              type="number"
              min={0}
              className="form-control"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>
      </form>
    </GenericModal>
  );
}
