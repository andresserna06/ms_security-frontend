import React, { useEffect, useState } from "react";
import { CFormLabel, CFormSelect } from "@coreui/react";
import { Permission } from "../../models/Permission";
import FormInput from "../../components/common/FormInput";
import GenericButton from "../../components/common/GenericButton";

interface PermissionFormProps {
  initialPermission?: Permission | null;
  onSubmit: (permission: Permission) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
}

interface FormErrors {
  url?: string;
  model?: string;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"];

const emptyPermission = () => new Permission({ url: "", method: "GET", model: "" });

export default function PermissionForm({
  initialPermission = null,
  onSubmit,
  onCancel,
  isSaving = false,
}: PermissionFormProps) {
  const [permission, setPermission] = useState<Permission>(emptyPermission());
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialPermission) {
      setPermission(
        new Permission({
          id: initialPermission.id,
          url: initialPermission.url,
          method: initialPermission.method,
          model: initialPermission.model,
        }),
      );
    } else {
      setPermission(emptyPermission());
    }
    setErrors({});
  }, [initialPermission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPermission((prev) => new Permission({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!permission.url || permission.url.trim() === "") {
      newErrors.url = "La URL del permiso es obligatoria.";
    } else if (!permission.url.trim().startsWith("/")) {
      newErrors.url = "La URL debe empezar con /. Ej. /api/users";
    }
    if (!permission.model || permission.model.trim() === "") {
      newErrors.model = "El modelo del permiso es obligatorio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(
      new Permission({
        ...permission,
        url: permission.url.trim(),
        model: permission.model.trim(),
      }),
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormInput
        label="URL"
        name="url"
        type="text"
        value={permission.url || ""}
        onChange={handleChange}
        placeholder="Ej. /api/users/{id}"
        required
        error={errors.url || null}
      />

      <div className="mb-3">
        <CFormLabel htmlFor="permission-method">Método</CFormLabel>
        <CFormSelect
          id="permission-method"
          name="method"
          value={permission.method}
          onChange={handleChange}
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </CFormSelect>
      </div>

      <FormInput
        label="Modelo"
        name="model"
        type="text"
        value={permission.model || ""}
        onChange={handleChange}
        placeholder="Ej. User"
        required
        error={errors.model || null}
      />

      <div className="d-flex justify-content-end gap-2 mt-4">
        <GenericButton label="Cancelar" variant="secondary" type="button" onClick={onCancel} disabled={isSaving} />
        <GenericButton
          label={isSaving ? "Guardando..." : "Guardar"}
          variant="primary"
          type="submit"
          disabled={isSaving}
        />
      </div>
    </form>
  );
}
