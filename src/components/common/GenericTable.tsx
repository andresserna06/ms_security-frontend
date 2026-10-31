import React from "react";
import Loader from "./Loader";
import Alert from "./Alert";

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TableAction<T> {
  label: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "outline-primary" | "outline-secondary" | "outline-danger" | "outline-success" | "outline-info" | "outline-warning";
  onClick: (item: T) => void;
}

interface GenericTableProps<T> {
  data: T[] | null;
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  getKey: (item: T, index: number) => React.Key;
  isLoading?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onRowClick?: (item: T) => void;
  selectedKey?: React.Key | null;
}

export default function GenericTable<T>({
  data,
  columns,
  actions = [],
  getKey,
  isLoading = false,
  emptyMessage = "No hay registros para mostrar",
  errorMessage = "Ocurrió un error al cargar la información",
  onRowClick,
  selectedKey,
}: GenericTableProps<T>) {
  if (isLoading) {
    return <Loader text="Cargando..." />;
  }

  if (!data) {
    return <Alert type="danger" message={errorMessage} />;
  }

  if (data.length === 0) {
    return <div className="alert alert-info">{emptyMessage}</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            {columns.map((col, cIndex) => (
              <th key={cIndex}>{col.header}</th>
            ))}
            {actions.length > 0 ? <th>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const rowKey = getKey(item, index);
            const isSelected =
              selectedKey !== undefined && selectedKey !== null && rowKey === selectedKey;

            return (
              <tr
                key={rowKey}
                className={isSelected ? "table-active" : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col, cIndex) => (
                  <td key={cIndex}>
                    {col.render
                      ? col.render(item, index)
                      : col.accessor
                      ? String((item as any)[col.accessor] ?? "")
                      : null}
                  </td>
                ))}
                {actions.length > 0 ? (
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {actions.map((action, aIndex) => (
                        <button
                          key={aIndex}
                          type="button"
                          className={`btn btn-${action.variant ?? "secondary"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(item);
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
