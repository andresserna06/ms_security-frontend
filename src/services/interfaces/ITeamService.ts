import { Team } from "../../models/Team";

export interface ITeamService {
  getAll(active?: boolean): Promise<Team[]>;
}
