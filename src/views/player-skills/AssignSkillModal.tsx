import React, { useEffect, useMemo, useState } from "react";
import { Skill } from "../../models/Skill";
import GenericModal from "../../components/common/GenericModal";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";

export interface AssignSkillModalProps {
  visible: boolean;
  playerLabel: string;
  skills: Skill[];
  assignedSkillIds: Set<number>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (skillId: number, level?: number) => Promise<void>;
}

export default function AssignSkillModal({
  visible,
  playerLabel,
  skills,
  assignedSkillIds,
  submitting,
  onClose,
  onSubmit,
}: AssignSkillModalProps) {
  const [skillId, setSkillId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [skillError, setSkillError] = useState<string | null>(null);
  const [levelError, setLevelError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const availableSkills = useMemo(
    () => skills.filter((s) => !assignedSkillIds.has(s.id)),
    [skills, assignedSkillIds],
  );

  useEffect(() => {
    if (visible) {
      setSkillId("");
      setLevel("");
      setSkillError(null);
      setLevelError(null);
      setServerError(null);
    }
  }, [visible]);

  const validate = (): boolean => {
    let valid = true;

    const parsedSkillId = Number(skillId);
    if (!skillId || !Number.isInteger(parsedSkillId) || parsedSkillId < 1) {
      setSkillError("Debes seleccionar una habilidad.");
      valid = false;
    } else {
      setSkillError(null);
    }

    if (level !== "") {
      const parsedLevel = Number(level);
      if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 5) {
        setLevelError("El nivel debe estar entre 1 y 5.");
        valid = false;
      } else {
        setLevelError(null);
      }
    } else {
      setLevelError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);
    try {
      await onSubmit(Number(skillId), level !== "" ? Number(level) : undefined);
    } catch (err: any) {
      setServerError(err?.message || "No fue posible asignar la habilidad.");
    }
  };

  return (
    <GenericModal
      visible={visible}
      title="Asignar habilidad a jugador"
      onClose={submitting ? () => {} : onClose}
      backdrop="static"
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-body-secondary small mb-3">
          Jugador seleccionado: <strong>{playerLabel}</strong>
        </p>

        {serverError ? (
          <Alert
            type="danger"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        ) : null}

        {availableSkills.length === 0 ? (
          <Alert
            type="info"
            message="Este jugador ya tiene todas las habilidades disponibles en el catálogo asignadas."
          />
        ) : null}

        <div className="mb-3">
          <label htmlFor="assign-skill-select" className="form-label">
            Habilidad <span className="text-danger">*</span>
          </label>
          <select
            id="assign-skill-select"
            className={`form-select ${skillError ? "is-invalid" : ""}`}
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            disabled={submitting || availableSkills.length === 0}
            required
          >
            <option value="">Selecciona una habilidad...</option>
            {availableSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name} — {skill.description}
              </option>
            ))}
          </select>
          {skillError ? (
            <div className="invalid-feedback">{skillError}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label htmlFor="assign-skill-level" className="form-label">
            Nivel de dominio (opcional)
          </label>
          <select
            id="assign-skill-level"
            className={`form-select ${levelError ? "is-invalid" : ""}`}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={submitting || availableSkills.length === 0}
          >
            <option value="">Sin especificar</option>
            <option value="1">1 — Básico</option>
            <option value="2">2 — En desarrollo</option>
            <option value="3">3 — Intermedio</option>
            <option value="4">4 — Avanzado</option>
            <option value="5">5 — Experto</option>
          </select>
          {levelError ? (
            <div className="invalid-feedback">{levelError}</div>
          ) : null}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <GenericButton
            label="Cancelar"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          />
          <button
            type="submit"
            className="btn btn-sports-primary"
            disabled={submitting || availableSkills.length === 0}
          >
            {submitting ? "Asignando..." : "Asignar habilidad"}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
