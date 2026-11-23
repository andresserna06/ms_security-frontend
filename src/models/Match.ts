export type MatchStatus = "SCHEDULED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export interface Match {
  id: number;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  venueId?: number | null;
  phaseId: number;
}

export interface MatchCreatePayload {
  scheduledAt: string;
  homeTeamId?: number;
  awayTeamId?: number;
}

export interface MatchUpdatePayload {
  scheduledAt?: string;
  phaseId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
}

export interface MatchResultPayload {
  homeScore: number;
  awayScore: number;
}

export interface MatchFinishPayload {
  homeScore: number;
  awayScore: number;
}

export interface UpdateMatchResultPayload {
  homeScore: number;
  awayScore: number;
}

export interface FinishMatchPayload {
  homeScore?: number;
  awayScore?: number;
}

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En juego",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  SCHEDULED: "primary",
  IN_PROGRESS: "warning",
  FINISHED: "success",
  CANCELLED: "secondary",
};
