import React from "react";
import { CAlert, CBadge, CCol, CFormCheck, CProgress, CRow } from "@coreui/react";
import { Role } from "../../models/Role";
import SidebarSummary, { ThemeColor } from "../../components/common/SidebarSummary";

interface RoleSummaryPanelProps {
  role: Role | null;
  totalAvailable: number;
  totalAssigned: number;
  modulesWithAccess: number;
}

function SummaryItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <span className="text-body-secondary">{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function CounterTile({ label, value, color }: { label: string; value: number; color: ThemeColor }) {
  return (
    <div className={`rounded-3 p-2 h-100 text-center bg-${color}-subtle text-${color}-emphasis`}>
      <div style={{ fontSize: "0.7rem" }}>{label}</div>
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
  const percentAssigned = totalAvailable === 0 ? 0 : Math.round((totalAssigned / totalAvailable) * 100);

  return (
    <div className="d-flex flex-column gap-3">
      <SidebarSummary title="Resumen del rol" color="primary">
        <SummaryItem label="Nombre del rol:">
          {role ? <CBadge color="primary">{role.name}</CBadge> : "-"}
        </SummaryItem>
        <SummaryItem label="Estado:">
          <CBadge color="success">Activo</CBadge>
        </SummaryItem>
        <SummaryItem label="Usuarios asociados:">-</SummaryItem>
        <SummaryItem label="Permisos asignados:">{totalAssigned}</SummaryItem>
        <SummaryItem label="Módulos con acceso:">{modulesWithAccess}</SummaryItem>

        <CRow className="g-2 mt-2">
          <CCol xs={4}>
            <CounterTile label="Disponibles" value={totalAvailable} color="primary" />
          </CCol>
          <CCol xs={4}>
            <CounterTile label="Asignados" value={totalAssigned} color="success" />
          </CCol>
          <CCol xs={4}>
            <CounterTile label="Sin asignar" value={totalAvailable - totalAssigned} color="warning" />
          </CCol>
        </CRow>

        <CProgress className="mt-3" color="success" value={percentAssigned} />
        <div className="small text-body-secondary text-center mt-1">
          {percentAssigned}% de los permisos asignado
        </div>
      </SidebarSummary>

      <SidebarSummary title="Leyenda" color="info">
        <CFormCheck id="legend-assigned" label="Permiso asignado" checked readOnly />
        <CFormCheck id="legend-unassigned" label="Permiso no asignado" checked={false} readOnly />
      </SidebarSummary>

      <SidebarSummary title="Reglas de acceso" color="secondary">
        <ul className="mb-0">
          <li>Si al menos uno de los roles del usuario posee el permiso, la operación se permite.</li>
          <li>Si ninguno de sus roles posee el permiso requerido, el acceso se deniega.</li>
          <li>Los cambios aplican a todos los usuarios que tengan asignado este rol.</li>
        </ul>
      </SidebarSummary>

      <CAlert color="danger" className="mb-0">
        Retirar un permiso del rol no elimina el permiso del sistema.
      </CAlert>
    </div>
  );
}