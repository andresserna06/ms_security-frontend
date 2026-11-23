import React from "react";
import { CBadge } from "@coreui/react";
import { Registration } from "../../models/Registration";
import GenericTable, { TableColumn } from "../../components/common/GenericTable";

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface RegistrationsTableProps {
  registrations: Registration[] | null;
  isLoading: boolean;
  errorMessage?: string;
  onWithdraw: (registration: Registration) => void;
}

export default function RegistrationsTable({
  registrations,
  isLoading,
  errorMessage = "No fue posible obtener las inscripciones.",
  onWithdraw,
}: RegistrationsTableProps) {
  const columns: TableColumn<Registration>[] = [
    {
      header: "Equipo",
      render: (registration) =>
        registration.teamName || `Equipo #${registration.teamId}`,
    },
    {
      header: "Fecha inscripción",
      render: (registration) => formatDate(registration.registeredAt),
    },
    {
      header: "Estado",
      render: (registration) => {
        const isWithdrawn = registration.status === "WITHDRAWN";
        return (
          <CBadge
            color={isWithdrawn ? "secondary" : "success"}
            shape="rounded-pill"
          >
            {isWithdrawn ? "Retirada" : "Confirmada"}
          </CBadge>
        );
      },
    },
    {
      header: "Acciones",
      render: (registration) => {
        const hasValidTeamId =
          Number.isInteger(registration.teamId) && registration.teamId > 0;

        if (registration.status === "WITHDRAWN") {
          return registration.withdrawnAt ? (
            <span className="text-body-secondary small">
              Retirada el {formatDate(registration.withdrawnAt)}
            </span>
          ) : null;
        }

        if (!hasValidTeamId) {
          return <span className="text-body-secondary small">-</span>;
        }

        return (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw(registration);
            }}
          >
            Retirar
          </button>
        );
      },
    },
  ];

  return (
    <GenericTable<Registration>
      data={registrations}
      columns={columns}
      getKey={(registration, index) =>
        registration.id ?? `${registration.tournamentId}-${registration.teamId}-${index}`
      }
      isLoading={isLoading}
      emptyMessage="No hay equipos inscritos para el filtro seleccionado."
      errorMessage={errorMessage}
    />
  );
}
