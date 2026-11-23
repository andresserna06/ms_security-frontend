import { Player } from "./Player";
import { Team } from "./Team";

export interface CreatePlayerContractPayload {
  playerId: number;
  startDate: string;
  endDate?: string;
}

export class PlayerContract {
  id!: number;
  playerId!: number;
  teamId!: number;
  startDate!: string;
  endDate?: string | null;
  current!: boolean;

  constructor(data?: Partial<PlayerContract>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class TeamPlayerContract {
  id!: number;
  playerId!: number;
  startDate!: string;
  endDate?: string | null;
  current!: boolean;
  player!: Player;

  constructor(data?: Partial<TeamPlayerContract>) {
    if (data) {
      Object.assign(this, data);
      if (data.player) {
        this.player = new Player(data.player);
      }
    }
  }
}

export class PlayerTeamContract {
  id!: number;
  teamId!: number;
  startDate!: string;
  endDate?: string | null;
  current!: boolean;
  team!: Team;

  constructor(data?: Partial<PlayerTeamContract>) {
    if (data) {
      Object.assign(this, data);
      if (data.team) {
        this.team = new Team(data.team);
      }
    }
  }
}
