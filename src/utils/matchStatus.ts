// Labels and badge classes of the match states returned by ms_sports.

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

const STATUS_BADGES: Record<string, string> = {
  SCHEDULED: "bg-info text-dark",
  IN_PROGRESS: "bg-warning text-dark",
  FINISHED: "badge-sports",
  CANCELLED: "bg-secondary",
};

const SCORING_TYPE_LABELS: Record<string, string> = {
  GOAL: "Gol",
  OWN_GOAL: "Autogol",
  PENALTY: "Penal",
  POINT: "Punto",
};

export function scoringTypeLabel(type: string): string {
  return SCORING_TYPE_LABELS[type.toUpperCase()] ?? type;
}

export function matchStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function matchStatusBadge(status: string): string {
  return STATUS_BADGES[status] ?? "bg-secondary";
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
