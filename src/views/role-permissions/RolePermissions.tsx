import React, { useEffect, useMemo, useState } from "react";
import { CAlert, CCard, CCardBody, CCol, CFormSelect, CRow } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilInfo, cilLockLocked, cilShieldAlt } from "@coreui/icons";
import { Role } from "../../models/Role";
import { Permission } from "../../models/Permission";
import { IRoleService } from "../../services/interfaces/IRoleService";
import { IPermissionService } from "../../services/interfaces/IPermissionService";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import PermissionMatrix from "../../components/permissions/PermissionMatrix";
import RoleSummaryPanel from "../../components/permissions/RoleSummaryPanel";
import { buildMatrixGroups, countModulesWithAccess } from "../../utils/permissionMatrix";

interface RolePermissionsProps {
  roleService: IRoleService;
  permissionService: IPermissionService;
}

const INFO_MESSAGE =
  "Los permisos seleccionados se conservarán después de cerrar e iniciar sesión nuevamente.";

export default function RolePermissions({ roleService, permissionService }: RolePermissionsProps) {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[] | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [initialAssigned, setInitialAssigned] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getAll(),
        permissionService.getAll(),
      ]);
      setRoles(rolesRes);
      setAllPermissions(permsRes);
      if (permsRes === null) {
        setError("No fue posible cargar el catálogo de permisos.");
      }
      setIsLoading(false);
    };
    load();
  }, [roleService, permissionService]);

  const selectedRole = roles?.find((role) => String(role.id) === selectedRoleId) ?? null;

  const matrixGroups = useMemo(
    () => buildMatrixGroups(allPermissions ?? []),
    [allPermissions],
  );

  const totalAvailable = allPermissions?.length ?? 0;
  const modulesWithAccess = useMemo(
    () => countModulesWithAccess(matrixGroups, assignedIds),
    [matrixGroups, assignedIds],
  );

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setAssignedIds(new Set());
    setInitialAssigned(new Set());
    clearMessages();
  };

  const loadAssigned = async () => {
    setIsLoadingAssigned(true);
    const assigned = await permissionService.getByRole(Number(selectedRoleId));
    if (assigned === null) {
      setError("No fue posible cargar los permisos del rol seleccionado.");
      setAssignedIds(new Set());
      setInitialAssigned(new Set());
    } else {
      const ids = new Set(assigned.map((permission) => permission.id));
      setAssignedIds(new Set(ids));
      setInitialAssigned(ids);
    }
    setIsLoadingAssigned(false);
  };

  const handleLoadPermissions = async () => {
    clearMessages();
    await loadAssigned();
  };

  const handleToggle = (permissionId: number) => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
    clearMessages();
  };

  const handleReset = () => {
    setAssignedIds(new Set(initialAssigned));
    clearMessages();
  };

  const handleSave = async () => {
    setIsSaving(true);
    clearMessages();
    const roleId = Number(selectedRoleId);
    const toAdd = Array.from(assignedIds).filter((id) => !initialAssigned.has(id));
    const toRemove = Array.from(initialAssigned).filter((id) => !assignedIds.has(id));

    const added = await permissionService.assignToRole(roleId, toAdd);
    const removed = await Promise.all(toRemove.map((id) => permissionService.removeFromRole(roleId, id)));

    if (added === null || removed.includes(null)) {
      setError("No fue posible guardar todos los cambios.");
      await loadAssigned();
    } else {
      setSuccess("Permisos actualizados correctamente.");
      setInitialAssigned(new Set(assignedIds));
    }
    setIsSaving(false);
  };

  let content: React.ReactNode;
  if (isLoading) {
    content = <Loader text="Cargando información..." />;
  } else if (isLoadingAssigned) {
    content = <Loader text="Cargando permisos del rol..." />;
  } else if (selectedRoleId) {
    content = (
      <PermissionMatrix
        groups={matrixGroups}
        selectedPermissionIds={assignedIds}
        onToggle={handleToggle}
      />
    );
  } else {
    content = (
      <div className="text-center py-5 px-3 rounded-3 border bg-body-tertiary text-body-secondary">
        <CIcon icon={cilLockLocked} size="3xl" className="mb-3 text-primary" />
        <div className="fw-semibold">Seleccione un rol para ver la matriz de permisos.</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      <CRow>
        <CCol lg={9}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-3 bg-primary-subtle text-primary-emphasis d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "52px", height: "52px" }}
            >
              <CIcon icon={cilShieldAlt} size="xl" />
            </div>
            <div>
              <h2 className="mb-0 text-body">Asignar Permisos a Roles</h2>
              <div className="text-body-secondary">
                Administra de manera centralizada los permisos que puede ejecutar cada rol del sistema.
              </div>
            </div>
          </div>

          <CCard className="mb-3 shadow-sm bg-body border-top-primary border-top-3">
            <CCardBody className="d-flex flex-wrap align-items-end gap-2">
              <div style={{ minWidth: "280px" }}>
                <label className="form-label">Rol seleccionado</label>
                <CFormSelect value={selectedRoleId} onChange={(e) => handleSelectRole(e.target.value)}>
                  <option value="">Seleccione un rol</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={String(role.id)}>
                      {role.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <GenericButton
                label="Cargar permisos"
                variant="primary"
                onClick={handleLoadPermissions}
                disabled={!selectedRoleId || isLoadingAssigned}
              />
              <GenericButton
                label="Guardar cambios"
                variant="success"
                onClick={handleSave}
                disabled={!selectedRoleId || isSaving || isLoadingAssigned}
              />
              <GenericButton
                label="Restablecer"
                variant="outline-warning"
                onClick={handleReset}
                disabled={!selectedRoleId || isSaving || isLoadingAssigned}
              />
            </CCardBody>
          </CCard>

          <div className="d-flex flex-wrap gap-3 mb-3">
            {error ? (
              <div className="flex-fill">
                <Alert type="danger" message={error} onClose={() => setError(null)} />
              </div>
            ) : null}
            {success ? (
              <div className="flex-fill">
                <Alert type="success" message={success} onClose={() => setSuccess(null)} />
              </div>
            ) : null}
            <CAlert color="info" className="flex-fill mb-0 d-flex align-items-center gap-2">
              <CIcon icon={cilInfo} className="flex-shrink-0" />
              <span>{INFO_MESSAGE}</span>
            </CAlert>
          </div>

          {content}
        </CCol>

        <CCol lg={3}>
          <RoleSummaryPanel
            role={selectedRole}
            totalAvailable={totalAvailable}
            totalAssigned={assignedIds.size}
            modulesWithAccess={modulesWithAccess}
          />
        </CCol>
      </CRow>
    </div>
  );
}