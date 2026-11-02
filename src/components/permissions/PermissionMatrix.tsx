import React, { useEffect, useRef, useState } from "react";
import { CCard, CCardBody, CCardHeader, CFormCheck } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilChevronBottom, cilChevronRight } from "@coreui/icons";
import { ActionKey, MatrixGroups } from "../../utils/permissionMatrix";

interface PermissionMatrixProps {
  groups: MatrixGroups;
  selectedPermissionIds: Set<number>;
  onToggleCell: (permissionIds: number[]) => void;
}

interface MatrixCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  title: string;
  ariaLabel: string;
  disabled?: boolean;
  onChange: () => void;
}

const ACTIONS: { key: ActionKey; label: string }[] = [
  { key: "ver", label: "Ver" },
  { key: "listar", label: "Listar" },
  { key: "crear", label: "Crear" },
  { key: "actualizar", label: "Actualizar" },
  { key: "eliminar", label: "Eliminar" },
];

const NO_EXISTING_PERMISSION_TITLE = "Este permiso no existe en el sistema";

function MatrixCheckbox({
  checked,
  indeterminate,
  title,
  ariaLabel,
  disabled = false,
  onChange,
}: MatrixCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <CFormCheck
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      title={title}
      aria-label={ariaLabel}
    />
  );
}

export default function PermissionMatrix({
  groups,
  selectedPermissionIds,
  onToggleCell,
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
                  <th
                    key={action.key}
                    className="text-center"
                    style={{ width: "120px" }}
                    translate="no"
                  >
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
                          {ACTIONS.map((action) => {
                            const cellPermissions = row.permissionsByAction[action.key];
                            const cellPermissionIds = cellPermissions.map(
                              (permission) => permission.id,
                            );
                            const assignedCount = cellPermissions.filter((permission) =>
                              selectedPermissionIds.has(permission.id),
                            ).length;
                            const allSelected =
                              cellPermissions.length > 0 &&
                              assignedCount === cellPermissions.length;
                            const someSelected = assignedCount > 0 && !allSelected;

                            return (
                              <td key={action.key} className="text-center">
                                {cellPermissions.length === 0 ? (
                                  <MatrixCheckbox
                                    checked={false}
                                    indeterminate={false}
                                    title={NO_EXISTING_PERMISSION_TITLE}
                                    ariaLabel={NO_EXISTING_PERMISSION_TITLE}
                                    onChange={() => undefined}
                                    disabled
                                  />
                                ) : (
                                  <MatrixCheckbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    title={cellPermissions
                                      .map((permission) => `${permission.method} ${permission.url}`)
                                      .join("\n")}
                                    ariaLabel={`Permisos de ${row.resource} para ${action.label}`}
                                    onChange={() => onToggleCell(cellPermissionIds)}
                                  />
                                )}
                              </td>
                            );
                          })}
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