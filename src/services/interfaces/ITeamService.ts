import { Team, TeamPayload } from "../../models/Team";

export interface ITeamService {
  getAll(active?: boolean): Promise<Team[]>;
  getById(id: number): Promise<Team>;
  create(payload: TeamPayload): Promise<Team>;
  update(id: number, payload: TeamPayload): Promise<Team>;
  activate(id: number): Promise<Team>;
  deactivate(id: number): Promise<Team>;
  remove(id: number): Promise<void>;
}
