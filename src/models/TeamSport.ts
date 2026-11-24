export interface TeamSportParty {
  id: number;
  name: string;
}

// Association created between a team and a sport (POST /teams/:teamId/sports/:sportId).
export class TeamSport {
  id!: number;
  team!: TeamSportParty;
  sport!: TeamSportParty;

  constructor(data?: Partial<TeamSport>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// A team or a sport seen from the other side of the association
// (GET /teams/:id/sports and GET /sports/:id/teams).
export class TeamSportSummary {
  id!: number;
  name!: string;
  active!: boolean;

  constructor(data?: Partial<TeamSportSummary>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
