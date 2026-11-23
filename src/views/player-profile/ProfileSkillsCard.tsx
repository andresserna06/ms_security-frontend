import React from "react";
import { PlayerAssignedSkill } from "../../models/PlayerSkill";

export interface ProfileSkillsCardProps {
  skills: PlayerAssignedSkill[];
  skillsMessage: string | null;
}

function formatAssignedDate(iso: string): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ProfileSkillsCard({
  skills,
  skillsMessage,
}: ProfileSkillsCardProps) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Habilidades asignadas</span>
        <span className="badge rounded-pill badge-sports">{skills.length}</span>
      </div>
      <div className="card-body">
        {skills.length === 0 ? (
          <div className="alert alert-info mb-0">
            {skillsMessage || "El jugador no tiene habilidades registradas"}
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {skills.map((item) => (
              <li
                key={item.id}
                className="list-group-item px-0 py-2 d-flex justify-content-between align-items-start gap-2"
              >
                <div>
                  <div className="fw-semibold">
                    {item.skill?.name || `Habilidad #${item.skillId}`}
                  </div>
                  <div className="text-body-secondary small">
                    {item.skill?.description || "Sin descripción"}
                  </div>
                  <div className="text-body-secondary" style={{ fontSize: "0.75rem" }}>
                    Asignada: {formatAssignedDate(item.assignedAt)}
                  </div>
                </div>
                {item.level !== null && item.level !== undefined ? (
                  <span className="badge rounded-pill badge-sports flex-shrink-0">
                    Nivel {item.level} / 5
                  </span>
                ) : (
                  <span className="badge rounded-pill bg-light text-body-secondary border flex-shrink-0">
                    Sin nivel
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
