export interface ScoringEventPlayerSummary {
  id: number;
  document: string;
  position: string | null;
  jerseyNumber: number | null;
}

export interface ScoringEventTeamSummary {
  id: number;
  name: string;
}

export interface ScoringEventPayload {
  playerId: number;
  teamId: number;
  minute: number;
  type: string;
}

export class ScoringEvent {
  id!: number;
  matchId!: number;
  playerId!: number;
  teamId!: number;
  minute!: number;
  type!: string;
  player?: ScoringEventPlayerSummary;
  team?: ScoringEventTeamSummary;

  constructor(data?: Partial<ScoringEvent>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
