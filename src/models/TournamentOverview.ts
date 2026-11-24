import { Tournament } from "./Tournament";

export interface OverviewTeam {
  id: number;
  name: string;
}

export interface OverviewScoringEvent {
  id: number;
  minute: number;
  type: string;
  player: { id: number; document: string };
  team: OverviewTeam;
}

export interface OverviewMatch {
  id: number;
  scheduledAt: string;
  status: string;
  hasResult: boolean;
  homeTeam: OverviewTeam | null;
  awayTeam: OverviewTeam | null;
  homeScore: number | null;
  awayScore: number | null;
  scoringEvents: OverviewScoringEvent[];
}

export interface OverviewStanding {
  position: number;
  team: OverviewTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface OverviewBracketMatch {
  matchId: number;
  status: string;
  homeTeam: OverviewTeam | null;
  awayTeam: OverviewTeam | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: OverviewTeam | null;
}

export type OverviewPhaseType = "GROUP_STAGE" | "KNOCKOUT";

export type FinalRound =
  | "ROUND_OF_16"
  | "QUARTERFINAL"
  | "SEMIFINAL"
  | "THIRD_PLACE"
  | "FINAL";

export interface OverviewPhase {
  id: number;
  name: string;
  order: number;
  type: OverviewPhaseType;
  teams?: OverviewTeam[];
  standings?: OverviewStanding[];
  finalRound?: FinalRound | null;
  bracket?: OverviewBracketMatch[];
  matches: OverviewMatch[];
}

// Development of a tournament (GET /tournaments/:id/overview, HU-GC-08).
export class TournamentOverview {
  tournament!: Tournament;
  message?: string;
  phases!: OverviewPhase[];

  constructor(data?: Partial<TournamentOverview>) {
    if (data) {
      Object.assign(this, data);
      this.tournament = new Tournament(data.tournament);
      this.phases = Array.isArray(data.phases) ? data.phases : [];
    }
  }
}
