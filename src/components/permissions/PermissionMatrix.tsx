import React, { useState } from "react";
import { CCard, CCardBody, CCardHeader, CFormCheck } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilChevronBottom, cilChevronRight } from "@coreui/icons";
import { ActionKey, MatrixGroups } from "../../utils/permissionMatrix";

interface PermissionMatrixProps {
  groups: MatrixGroups;
  selectedPermissionIds: Set<number>;
  onToggle: (permissionId: number) => void;
}

const ACTIONS: { key: ActionKey; label: string }[] = [
  { key: "ver", label: "Ver" },
  { key: "listar", label: "Listar" },
  { key: "crear", label: "Crear" },
  { key: "actualizar", label: "Actualizar" },
  { key: "eliminar", label: "Eliminar" },
];

export default function PermissionMatrix({
  groups,
  selectedPermissionIds,
  onToggle,
}: PermissionMatrixProps) {
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleName: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  return (
    <CCard>
      <CCardHeader>
        <strong>Matriz de permisos del rol</strong>
      </CCardHeader>
      <CCardBody className="p-0">
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: "220px" }}>Recurso</th>
                {ACTIONS.map((action) => (
                  <th key={action.key} className="text-center" style={{ width: "120px" }}>
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([moduleName, rows]) => {
                const isCollapsed = collapsedModules.has(moduleName);
                return (
                  <React.Fragment key={moduleName}>
                    <tr
                      className="table-secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleModule(moduleName)}
                    >
                      <td colSpan={1 + ACTIONS.length}>
                        <CIcon icon={isCollapsed ? cilChevronRight : cilChevronBottom} className="me-2" />
                        <strong>{moduleName}</strong>
                      </td>
                    </tr>
                    {!isCollapsed &&
                      rows.map((row) => (
                        <tr key={`${moduleName}-${row.model}`}>
                          <td>{row.resource}</td>
                          {ACTIONS.map((action) => (
                            <td key={action.key} className="text-center">
                              {row.permissionsByAction[action.key].map((permission) => (
                                <CFormCheck
                                  key={permission.id}
                                  type="checkbox"
                                  title={`${permission.method} ${permission.url}`}
                                  checked={selectedPermissionIds.has(permission.id)}
                                  onChange={() => onToggle(permission.id)}
                                />
                              ))}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CCardBody>
    </CCard>
  );
}