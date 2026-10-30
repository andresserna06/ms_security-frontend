import React, { useEffect, useState } from "react";
import { CFormLabel, CFormSelect } from "@coreui/react";
import { Permission } from "../../models/Permission";
import FormInput from "../../components/common/FormInput";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";
import { getPermissionResourceLabel } from "../../utils/permissionMatrix";

interface PermissionFormProps {
  initialPermission?: Permission | null;
  existingPermissions?: Permission[];
  serverError?: string | null;
  onSubmit: (permission: Permission) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
}

interface FormErrors {
  url?: string;
  method?: string;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

// Forma canónica de una URL para comparar duplicados:
// sin espacios, sin barras finales y sin nombres de parámetros.
// /api/users/ == /api/users  y  /api/users/{id} == /api/users/{userId}
const normalizeUrl = (url: string) =>
  url.trim().replace(/\/+$/, "").replace(/\{[^}]*\}/g, "{}") || "/";

// Versión que se guarda: limpia espacios y barra final, conserva los nombres de parámetros.
const cleanUrl = (url: string) => url.trim().replace(/\/+$/, "") || "/";

const emptyPermission = () => new Permission({ url: "", method: "GET" });

export default function PermissionForm({
  initialPermission = null,
  existingPermissions = [],
  serverError = null,
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
          method: initialPermission.method?.toUpperCase() || "GET",
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
    const url = permission.url.trim();
    const method = permission.method.trim().toUpperCase();

    if (url === "") {
      newErrors.url = "La URL del permiso es obligatoria.";
    } else if (!url.startsWith("/")) {
      newErrors.url = "La URL debe empezar con /. Ej. /api/users";
    } else if (url.length > 255) {
      newErrors.url = "La URL no puede superar 255 caracteres.";
    } else {
      const duplicated = existingPermissions.some(
        (existing) =>
          existing.id !== permission.id &&
          existing.method?.trim().toUpperCase() === method &&
          normalizeUrl(existing.url ?? "") === normalizeUrl(url),
      );
      if (duplicated) {
        newErrors.url =
          "Ya existe un permiso con ese método y esa URL (se ignoran la barra final y el nombre de los parámetros).";
      }
    }

    if (!HTTP_METHODS.includes(method)) {
      newErrors.method = "Seleccione un método HTTP válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving || !validate()) return;
    await onSubmit(
      new Permission({
        ...permission,
        url: cleanUrl(permission.url),
        method: permission.method.trim().toUpperCase(),
      }),
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError ? <Alert type="danger" message={serverError} /> : null}

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

      <div className="form-text mb-3">
        Módulo detectado:{" "}
        <strong>
          {permission.url.trim() ? getPermissionResourceLabel(permission) : "se deduce de la URL"}
        </strong>
      </div>

      <div className="mb-3">
        <CFormLabel htmlFor="permission-method">Método</CFormLabel>
        <CFormSelect
          id="permission-method"
          name="method"
          value={permission.method}
          onChange={handleChange}
          className={errors.method ? "is-invalid" : ""}
          translate="no"
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </CFormSelect>
        {errors.method ? <div className="invalid-feedback">{errors.method}</div> : null}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <GenericButton
          label="Cancelar"
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        />
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