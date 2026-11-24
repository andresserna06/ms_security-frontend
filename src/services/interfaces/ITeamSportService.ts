import { TeamSport, TeamSportSummary } from "../../models/TeamSport";

export interface ITeamSportService {
  associate(teamId: number, sportId: number): Promise<TeamSport>;
  dissociate(teamId: number, sportId: number): Promise<void>;
  getSportsOfTeam(teamId: number, active?: boolean): Promise<TeamSportSummary[]>;
  getTeamsOfSport(sportId: number, active?: boolean): Promise<TeamSportSummary[]>;
}
