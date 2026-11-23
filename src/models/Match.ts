export type MatchStatus = "SCHEDULED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export interface UpdateMatchResultPayload {
  homeScore: number;
  awayScore: number;
}

export interface FinishMatchPayload {
  homeScore?: number;
  awayScore?: number;
}

export class Match {
  id!: number;
  scheduledAt!: string;
  status!: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  venueId?: number | null;
  phaseId!: number;

  constructor(data?: Partial<Match>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
