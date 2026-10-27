import React, { useEffect, useState } from "react";
import { Role } from "../../models/Role";
import FormInput from "../../components/common/FormInput";
import GenericButton from "../../components/common/GenericButton";

interface RoleFormProps {
  initialRole?: Role | null;
  onSubmit: (role: Role) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
}

export default function RoleForm({ initialRole = null, onSubmit, onCancel, isSaving = false }: RoleFormProps) {
  const [role, setRole] = useState<Role>(new Role({ name: "", description: "" }));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialRole) {
      setRole(new Role({ id: initialRole.id, name: initialRole.name, description: initialRole.description }));
    } else {
      setRole(new Role({ name: "", description: "" }));
    }
    setErrors({});
  }, [initialRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRole((prev) => new Role({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!role.name || role.name.trim() === "") {
      newErrors.name = "El nombre del rol es obligatorio.";
    }
    if (!role.description || role.description.trim() === "") {
      newErrors.description = "La descripción del rol es obligatoria.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(role);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormInput
        label="Nombre"
        name="name"
        type="text"
        value={role.name || ""}
        onChange={handleChange}
        placeholder="Ej. ADMIN"
        required
        error={errors.name || null}
      />
      <FormInput
        label="Descripción"
        name="description"
        type="text"
        value={role.description || ""}
        onChange={handleChange}
        placeholder="Ej. Administrador del sistema"
        required
        error={errors.description || null}
      />

      <div className="d-flex justify-content-end gap-2 mt-4">
        <GenericButton label="Cancelar" variant="secondary" type="button" onClick={onCancel} disabled={isSaving} />
        <GenericButton label={isSaving ? "Guardando..." : "Guardar"} variant="primary" type="submit" disabled={isSaving} />
      </div>
    </form>
  );
}
