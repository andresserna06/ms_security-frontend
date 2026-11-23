import { Team } from "../models/Team";
import { ITeamService } from "./interfaces/ITeamService";
import { sportsRequest } from "./sportsHttp";

export class TeamService implements ITeamService {
  private readonly endpoint = "/teams";

  async getAll(active?: boolean): Promise<Team[]> {
    const params = new URLSearchParams();
    if (active !== undefined) {
      params.set("active", String(active));
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<Team[]>(path);
    return Array.isArray(data) ? data.map((t) => new Team(t)) : [];
  }
}
