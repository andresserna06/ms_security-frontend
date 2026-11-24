import { TeamSport, TeamSportSummary } from "../models/TeamSport";
import { ITeamSportService } from "./interfaces/ITeamSportService";
import { sportsRequest } from "./sportsHttp";

function withActive(path: string, active?: boolean): string {
  return active === undefined ? path : `${path}?active=${String(active)}`;
}

export class TeamSportService implements ITeamSportService {
  async associate(teamId: number, sportId: number): Promise<TeamSport> {
    const data = await sportsRequest<TeamSport>(
      `/teams/${teamId}/sports/${sportId}`,
      { method: "POST" },
    );
    return new TeamSport(data);
  }

  async dissociate(teamId: number, sportId: number): Promise<void> {
    await sportsRequest<void>(`/teams/${teamId}/sports/${sportId}`, {
      method: "DELETE",
    });
  }

  async getSportsOfTeam(
    teamId: number,
    active?: boolean,
  ): Promise<TeamSportSummary[]> {
    const data = await sportsRequest<TeamSportSummary[]>(
      withActive(`/teams/${teamId}/sports`, active),
    );
    return Array.isArray(data) ? data.map((s) => new TeamSportSummary(s)) : [];
  }

  async getTeamsOfSport(
    sportId: number,
    active?: boolean,
  ): Promise<TeamSportSummary[]> {
    const data = await sportsRequest<TeamSportSummary[]>(
      withActive(`/sports/${sportId}/teams`, active),
    );
    return Array.isArray(data) ? data.map((t) => new TeamSportSummary(t)) : [];
  }
}
