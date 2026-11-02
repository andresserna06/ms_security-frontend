import React, { useEffect, useMemo, useState } from "react";
import { CCard, CCardBody, CCol, CFormSelect, CRow } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilShieldAlt } from "@coreui/icons";
import { Role } from "../../models/Role";
import { Permission } from "../../models/Permission";
import { IRoleService } from "../../services/interfaces/IRoleService";
import { IPermissionService } from "../../services/interfaces/IPermissionService";
import GenericButton from "../../components/common/GenericButton";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import PermissionMatrix from "../../components/permissions/PermissionMatrix";
import RoleSummaryPanel from "../../components/permissions/RoleSummaryPanel";
import { buildMatrixGroups, countModulesWithAccess } from "../../utils/permissionMatrix";

interface RolePermissionsProps {
  roleService: IRoleService;
  permissionService: IPermissionService;
}

interface Feedback {
  type: "success" | "danger" | "info";
  message: string;
}

const INFO_MESSAGE =
  "Los permisos seleccionados se conservarán después de cerrar e iniciar sesión nuevamente.";

export default function RolePermissions({ roleService, permissionService }: RolePermissionsProps) {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[] | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [initialAssigned, setInitialAssigned] = useState<Set<number>>(new Set());
  const [loadedRoleId, setLoadedRoleId] = useState<number | null>(null);

  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [catalogReloadKey, setCatalogReloadKey] = useState(0);
  const [assignedReloadKey, setAssignedReloadKey] = useState(0);

  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      setCatalogError(null);
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getAll(),
        permissionService.getAll(),
      ]);

      if (cancelled) return;

      setRoles(rolesRes);
      setAllPermissions(permsRes);

      if (rolesRes === null && permsRes === null) {
        setCatalogError("No fue posible cargar los roles ni el catálogo de permisos.");
      } else if (rolesRes === null) {
        setCatalogError("No fue posible cargar la lista de roles.");
      } else if (permsRes === null) {
        setCatalogError("No fue posible cargar el catálogo de permisos.");
      }

      setIsLoadingCatalog(false);
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [roleService, permissionService, catalogReloadKey]);

  useEffect(() => {
    if (!selectedRoleId) {
      setAssignedIds(new Set());
      setInitialAssigned(new Set());
      setLoadedRoleId(null);
      setIsLoadingAssigned(false);
      setLoadError(null);
      return;
    }

    const roleId = Number(selectedRoleId);
    let cancelled = false;

    setIsLoadingAssigned(true);
    setLoadError(null);
    setAssignedIds(new Set());
    setInitialAssigned(new Set());
    setLoadedRoleId(null);

    const loadAssigned = async () => {
      try {
        const assigned = await permissionService.getByRole(roleId);
        if (cancelled) return;

        if (assigned === null) {
          setLoadError("No fue posible cargar los permisos del rol seleccionado.");
          setIsLoadingAssigned(false);
          return;
        }

        const ids = new Set(assigned.map((permission) => permission.id));
        setAssignedIds(new Set(ids));
        setInitialAssigned(ids);
        setLoadedRoleId(roleId);
        setIsLoadingAssigned(false);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setLoadError("No fue posible cargar los permisos del rol seleccionado.");
        setIsLoadingAssigned(false);
      }
    };

    void loadAssigned();

    return () => {
      cancelled = true;
    };
  }, [selectedRoleId, permissionService, assignedReloadKey]);

  const selectedRole = roles?.find((role) => String(role.id) === selectedRoleId) ?? null;
  const selectedRoleNumber = selectedRoleId ? Number(selectedRoleId) : null;
  const isCatalogReady = roles !== null && allPermissions !== null;
  const isAssignedReady =
    selectedRoleNumber !== null && loadedRoleId === selectedRoleNumber;

  const matrixGroups = useMemo(
    () => buildMatrixGroups(allPermissions ?? []),
    [allPermissions],
  );

  const totalAvailable = allPermissions?.length ?? 0;
  const modulesWithAccess = useMemo(
    () => countModulesWithAccess(matrixGroups, assignedIds),
    [matrixGroups, assignedIds],
  );

  const isDirty = useMemo(() => {
    if (!isAssignedReady) return false;
    if (assignedIds.size !== initialAssigned.size) return true;

    for (const permissionId of assignedIds) {
      if (!initialAssigned.has(permissionId)) return true;
    }

    return false;
  }, [assignedIds, initialAssigned, isAssignedReady]);

  const applyRoleSelection = (roleId: string) => {
    setSelectedRoleId(roleId);
    setAssignedIds(new Set());
    setInitialAssigned(new Set());
    setLoadedRoleId(null);
    setLoadError(null);
    setFeedback(null);
  };

  const handleSelectRole = (roleId: string) => {
    if (roleId === selectedRoleId) return;

    if (isDirty) {
      setPendingRoleId(roleId);
      setConfirmVisible(true);
      return;
    }

    applyRoleSelection(roleId);
  };

  const confirmRoleChange = () => {
    if (pendingRoleId === null) return;

    applyRoleSelection(pendingRoleId);
    setPendingRoleId(null);
    setConfirmVisible(false);
  };

  const cancelRoleChange = () => {
    setPendingRoleId(null);
    setConfirmVisible(false);
  };

  const handleToggleCell = (permissionIds: number[]) => {
    if (permissionIds.length === 0) return;

    setAssignedIds((prev) => {
      const next = new Set(prev);
      const allAssigned = permissionIds.every((permissionId) => prev.has(permissionId));

      permissionIds.forEach((permissionId) => {
        if (allAssigned) {
          next.delete(permissionId);
        } else {
          next.add(permissionId);
        }
      });

      return next;
    });
    setFeedback(null);
  };

  const handleReset = () => {
    if (!isAssignedReady) return;
    setAssignedIds(new Set(initialAssigned));
    setFeedback(null);
  };

  const handleRetryCatalog = () => {
    setCatalogReloadKey((key) => key + 1);
  };

  const handleRetryAssigned = () => {
    setLoadError(null);
    setAssignedReloadKey((key) => key + 1);
  };

  const formatPermissionLabel = (permissionId: number) => {
    const permission = allPermissions?.find((item) => item.id === permissionId);
    return permission ? `${permission.method} ${permission.url}` : `#${permissionId}`;
  };

  const formatFailedPermissions = (permissionIds: number[]) => {
    const labels = permissionIds.slice(0, 5).map(formatPermissionLabel);
    const remaining = permissionIds.length - labels.length;
    return `${labels.join(", ")}${remaining > 0 ? ` y ${remaining} más` : ""}`;
  };

  const handleSave = async () => {
    if (!isAssignedReady || isSaving) return;

    const roleId = Number(selectedRoleId);
    const toAdd = Array.from(assignedIds).filter((id) => !initialAssigned.has(id));
    const toRemove = Array.from(initialAssigned).filter((id) => !assignedIds.has(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      setFeedback({ type: "info", message: "No hay cambios para guardar." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setLoadError(null);

    try {
      const result = await permissionService.saveRolePermissions(roleId, toAdd, toRemove);

      if (result === null) {
        setFeedback({ type: "danger", message: "No fue posible guardar los cambios." });
        return;
      }

      const appliedCount = result.addedIds.length + result.removedIds.length;
      const failedIds = [...result.failedAddIds, ...result.failedRemoveIds];

      if (failedIds.length > 0) {
        setFeedback({
          type: "danger",
          message: `Se aplicaron ${appliedCount} cambio(s), pero fallaron ${failedIds.length}: ${formatFailedPermissions(failedIds)}.`,
        });
        setAssignedReloadKey((key) => key + 1);
      } else {
        setInitialAssigned(new Set(assignedIds));
        setFeedback({
          type: "success",
          message: `Se guardaron ${appliedCount} cambio(s) correctamente.`,
        });
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "danger", message: "No fue posible guardar los cambios." });
    } finally {
      setIsSaving(false);
    }
  };

  let content: React.ReactNode;
  if (isLoadingCatalog) {
    content = <Loader text="Cargando información..." />;
  } else if (!selectedRoleId) {
    content = (
      <div className="text-center py-5 px-3 rounded-3 border bg-body-tertiary text-body-secondary">
        <CIcon icon={cilLockLocked} size="3xl" className="mb-3 text-primary" />
        <div className="fw-semibold">Seleccione un rol para ver la matriz de permisos.</div>
      </div>
    );
  } else if (loadError) {
    content = (
      <div className="d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <Alert type="danger" message={loadError} />
        </div>
        <GenericButton
          label="Reintentar"
          variant="outline-danger"
          onClick={handleRetryAssigned}
          disabled={isLoadingAssigned || isSaving}
        />
      </div>
    );
  } else if (!isAssignedReady || isLoadingAssigned) {
    content = <Loader text="Cargando permisos del rol..." />;
  } else if (allPermissions === null) {
    content = <Alert type="info" message="No fue posible cargar el catálogo de permisos." />;
  } else if (totalAvailable === 0) {
    content = (
      <Alert
        type="info"
        message="No hay permisos registrados en el sistema. Registre permisos antes de asignarlos a un rol."
      />
    );
  } else {
    content = (
      <PermissionMatrix
        groups={matrixGroups}
        selectedPermissionIds={assignedIds}
        onToggleCell={handleToggleCell}
      />
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

          {catalogError ? (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <div className="flex-grow-1">
                <Alert type="danger" message={catalogError} />
              </div>
              <GenericButton
                label="Reintentar"
                variant="outline-danger"
                onClick={handleRetryCatalog}
                disabled={isLoadingCatalog}
              />
            </div>
          ) : null}

          {roles && roles.length === 0 ? (
            <div className="mb-3">
              <Alert type="info" message="No hay roles registrados en el sistema." />
            </div>
          ) : null}

          <CCard className="mb-3 shadow-sm bg-body border-top-primary border-top-3">
            <CCardBody className="d-flex flex-wrap align-items-end gap-2">
              <div style={{ minWidth: "280px" }}>
                <label className="form-label">Rol seleccionado</label>
                <CFormSelect
                  value={selectedRoleId}
                  onChange={(e) => handleSelectRole(e.target.value)}
                  disabled={
                    !isCatalogReady ||
                    isLoadingAssigned ||
                    isSaving ||
                    (roles?.length ?? 0) === 0
                  }
                >
                  <option value="">Seleccione un rol</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={String(role.id)}>
                      {role.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <GenericButton
                label="Guardar cambios"
                variant="success"
                onClick={handleSave}
                disabled={!isAssignedReady || !isDirty || isSaving || isLoadingAssigned}
              />
              <GenericButton
                label="Restablecer"
                variant="outline-warning"
                onClick={handleReset}
                disabled={!isAssignedReady || !isDirty || isSaving || isLoadingAssigned}
              />
            </CCardBody>
          </CCard>

          {feedback ? (
            <div className="mb-3">
              <Alert
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback(null)}
              />
            </div>
          ) : null}

          <div className="mb-3">
            <Alert type="info" message={INFO_MESSAGE} />
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

      <ConfirmModal
        visible={confirmVisible}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. ¿Deseas descartarlos y cambiar de rol?"
        confirmLabel="Descartar cambios"
        onConfirm={confirmRoleChange}
        onCancel={cancelRoleChange}
      />
    </div>
  );
}
