import React, { useCallback, useEffect, useState } from "react";
import {
  CAlert,
  CBadge,
  CButton,
  CCol,
  CFormSelect,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilTrash } from "@coreui/icons";
import { Role } from "../../models/Role";
import { UserRole } from "../../models/UserRole";
import { User } from "../../models/User";
import { IUserRoleService } from "../../services/interfaces/IUserRoleService";

interface UserRolesManagerProps {
  user: User;
  service: IUserRoleService;
  onRolesUpdated: () => void;
}

export default function UserRolesManager({
  user,
  service,
  onRolesUpdated,
}: UserRolesManagerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const loadRolesData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const [rolesCatalog, userRolesList] = await Promise.all([
      service.getAllRoles(),
      service.getByUser(user.id),
    ]);

    if (rolesCatalog === null || userRolesList === null) {
      setAllRoles(rolesCatalog ?? []);
      setAssignedRoles(userRolesList ?? []);
      setErrorMessage("No fue posible cargar la información de roles del usuario.");
      setLoading(false);
      return;
    }

    setAllRoles(rolesCatalog);
    setAssignedRoles(userRolesList);
    setSelectedRoleId("");
    setLoading(false);
  }, [service, user.id]);

  useEffect(() => {
    loadRolesData();
  }, [loadRolesData]);

  const assignedRoleIds = new Set(
    assignedRoles
      .map((assignment) => assignment.role?.id)
      .filter((roleId): roleId is number => typeof roleId === "number"),
  );
  const availableRoles = allRoles.filter((role) => !assignedRoleIds.has(role.id));

  const handleAssignRole = async () => {
    if (!selectedRoleId) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const assigned = await service.assignRole(user.id, Number(selectedRoleId));

    if (assigned === null) {
      setErrorMessage("No fue posible asignar el rol.");
      setSubmitting(false);
      return;
    }

    await loadRolesData();
    setSuccessMessage("Rol asignado correctamente al usuario.");
    setSubmitting(false);
    onRolesUpdated();
  };

  const handleRemoveRole = async (roleId?: number) => {
    if (!roleId) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const removed = await service.removeRole(user.id, roleId);

    if (removed !== true) {
      setErrorMessage("No fue posible retirar el rol.");
      setSubmitting(false);
      return;
    }

    await loadRolesData();
    setSuccessMessage("Rol retirado del usuario (el rol permanece en el sistema).");
    setSubmitting(false);
    onRolesUpdated();
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <CSpinner color="primary" size="sm" />
        <div className="mt-2 small text-body-secondary">Cargando roles...</div>
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <CAlert color="danger" className="py-2 small">
          {errorMessage}
        </CAlert>
      )}
      {successMessage && (
        <CAlert color="success" className="py-2 small">
          {successMessage}
        </CAlert>
      )}

      <div className="mb-4">
        <label htmlFor="select-role" className="form-label fw-semibold small">
          Asignar nuevo rol al usuario
        </label>
        <CRow className="g-2">
          <CCol sm={8}>
            <CFormSelect
              id="select-role"
              value={selectedRoleId}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              disabled={submitting || availableRoles.length === 0}
            >
              <option value="">
                {availableRoles.length === 0
                  ? "No hay más roles disponibles para asignar"
                  : "Selecciona un rol..."}
              </option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} — {role.description}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol sm={4}>
            <CButton
              color="primary"
              className="w-100"
              disabled={!selectedRoleId || submitting}
              onClick={handleAssignRole}
            >
              <CIcon icon={cilPlus} className="me-1" />
              Asignar rol
            </CButton>
          </CCol>
        </CRow>
      </div>

      <div>
        <div className="fw-semibold small mb-2">
          Roles actualmente asignados ({assignedRoles.length})
        </div>
        {assignedRoles.length === 0 ? (
          <div className="text-body-secondary small fst-italic py-3 text-center border rounded">
            Este usuario no tiene roles asignados actualmente.
          </div>
        ) : (
          <CListGroup>
            {assignedRoles.map((assignment) => (
              <CListGroupItem
                key={assignment.id || assignment.role?.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <CBadge color="primary" className="me-2">
                    {assignment.role?.name}
                  </CBadge>
                  <span className="small text-body-secondary">{assignment.role?.description}</span>
                </div>
                <CButton
                  color="danger"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleRemoveRole(assignment.role?.id ?? assignment.roleId)}
                  title="Retirar rol del usuario"
                >
                  <CIcon icon={cilTrash} className="me-1" />
                  Retirar
                </CButton>
              </CListGroupItem>
            ))}
          </CListGroup>
        )}
      </div>
    </>
  );
}
