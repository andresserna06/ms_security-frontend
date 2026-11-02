import React from "react";
import { CBadge, CCol, CFormCheck, CProgress, CRow } from "@coreui/react";
import { Role } from "../../models/Role";
import SidebarSummary, { ThemeColor } from "../../components/common/SidebarSummary";
import Alert from "../../components/common/Alert";
import { buildRolePermissionSummary } from "../../utils/permissionMatrix";

interface RoleSummaryPanelProps {
  role: Role | null;
  totalAvailable: number;
  totalAssigned: number;
  modulesWithAccess: number;
}

function SummaryItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <span className="text-body-secondary text-nowrap">{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function CounterTile({ label, value, color }: { label: string; value: number; color: ThemeColor }) {
  return (
    <div className={`rounded-3 p-1 h-100 text-center bg-${color}-subtle text-${color}-emphasis`}>
      <div className="text-nowrap fw-semibold" style={{ fontSize: "0.62rem" }}>
        {label}
      </div>
      <div className="fs-4 fw-bold">{value}</div>
    </div>
  );
}

export default function RoleSummaryPanel({
  role,
  totalAvailable,
  totalAssigned,
  modulesWithAccess,
}: RoleSummaryPanelProps) {
  const summary = buildRolePermissionSummary(totalAvailable, totalAssigned);

  return (
    <div className="d-flex flex-column gap-3">
      <SidebarSummary title="Resumen del rol" color="primary">
        <SummaryItem label="Nombre del rol:">
          {role ? <CBadge color="primary">{role.name}</CBadge> : "-"}
        </SummaryItem>
        <SummaryItem label="Total disponibles:">{summary.total}</SummaryItem>
        <SummaryItem label="Permisos asignados:">{summary.assigned}</SummaryItem>
        <SummaryItem label="Módulos con acceso:">{modulesWithAccess}</SummaryItem>

        <CRow className="g-2 mt-2">
          <CCol xs={4}>
            <CounterTile label="Disponibles" value={summary.total} color="primary" />
          </CCol>
          <CCol xs={4}>
            <CounterTile label="Asignados" value={summary.assigned} color="success" />
          </CCol>
          <CCol xs={4}>
            <CounterTile label="Sin asignar" value={summary.unassigned} color="warning" />
          </CCol>
        </CRow>

        <CProgress className="mt-3" color="success" value={summary.percentage} />
        <div className="small text-body-secondary text-center mt-1">
          {summary.percentage}% de los permisos asignados
        </div>
      </SidebarSummary>

      <SidebarSummary title="Leyenda" color="info">
        <div className="d-flex flex-wrap gap-2">
          <CFormCheck
            id="legend-assigned"
            label="Permiso asignado"
            checked
            readOnly
            className="mb-0 small"
          />
          <CFormCheck
            id="legend-unassigned"
            label="Permiso no asignado"
            checked={false}
            readOnly
            className="mb-0 small"
          />
        </div>
      </SidebarSummary>

      <SidebarSummary title="Reglas de acceso" color="secondary">
        <ul className="mb-0">
          <li>Si al menos uno de los roles del usuario posee el permiso, la operación se permite.</li>
          <li>Si ninguno de sus roles posee el permiso requerido, el acceso se deniega.</li>
          <li>Los cambios aplican a todos los usuarios que tengan asignado este rol.</li>
        </ul>
      </SidebarSummary>

      <Alert
        type="danger"
        message="Retirar un permiso del rol no elimina el permiso del sistema."
      />
    </div>
  );
}