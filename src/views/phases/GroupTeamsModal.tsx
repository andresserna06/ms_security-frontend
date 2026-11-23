import React, { useEffect, useState } from "react";
import { GroupTeam, Phase } from "../../models/Phase";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";

interface GroupTeamsModalProps {
  visible: boolean;
  phase: Phase | null;
  teams: GroupTeam[];
  assignableTeams: GroupTeam[];
  loading: boolean;
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onAssign: (teamId: number) => Promise<void>;
  onRemove: (teamId: number) => Promise<void>;
}

export default function GroupTeamsModal({
  visible,
  phase,
  teams,
  assignableTeams,
  loading,
  submitting,
  error,
  onClose,
  onAssign,
  onRemove,
}: GroupTeamsModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  useEffect(() => {
    if (visible) setSelectedTeamId("");
  }, [visible, phase?.id]);

  const handleAssign = async () => {
    const teamId = Number(selectedTeamId);
    if (!Number.isInteger(teamId) || teamId < 1) return;
    await onAssign(teamId);
    setSelectedTeamId("");
  };

  return (
    <GenericModal
      visible={visible}
      title={phase ? `Equipos - ${phase.name}` : "Equipos del grupo"}
      onClose={submitting ? () => {} : onClose}
      backdrop={submitting ? "static" : true}
      footer={
        <GenericButton
          label="Cerrar"
          variant="secondary"
          onClick={onClose}
          disabled={submitting}
        />
      }
    >
      {error ? <Alert type="danger" message={error} onClose={() => {}} /> : null}
      {loading ? (
        <Loader text="Cargando equipos..." />
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor="group-assign-team" className="form-label fw-semibold">
              Asignar equipo
            </label>
            <div className="d-flex gap-2">
              <select
                id="group-assign-team"
                className="form-select"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Seleccione un equipo</option>
                {assignableTeams.map((team) => (
                  <option key={team.id} value={String(team.id)}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-sports-primary"
                onClick={handleAssign}
                disabled={submitting || !selectedTeamId}
              >
                Asignar
              </button>
            </div>
            <div className="form-text">
              Solo se muestran equipos confirmados del torneo que no están en otro grupo.
            </div>
          </div>

          <div>
            <div className="fw-semibold mb-2">Equipos en el grupo</div>
            {teams.length === 0 ? (
              <div className="text-body-secondary small">No hay equipos asignados.</div>
            ) : (
              <ul className="list-group">
                {teams.map((team) => (
                  <li
                    key={team.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{team.name}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onRemove(team.id)}
                      disabled={submitting}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </GenericModal>
  );
}
