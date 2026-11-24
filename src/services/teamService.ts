import { Team, TeamPayload } from "../models/Team";
import { ITeamService } from "./interfaces/ITeamService";
import { sportsRequest } from "./sportsHttp";

function sanitizePayload(payload: TeamPayload): TeamPayload {
  const body: TeamPayload = {
    name: payload.name.trim(),
    city: payload.city.trim(),
    contactEmail: payload.contactEmail.trim(),
  };

  if (payload.foundedYear !== undefined && !Number.isNaN(Number(payload.foundedYear))) {
    body.foundedYear = Number(payload.foundedYear);
  }

  if (payload.logo) {
    body.logo = payload.logo;
  }

  return body;
}

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

  async getById(id: number): Promise<Team> {
    const data = await sportsRequest<Team>(`${this.endpoint}/${id}`);
    return new Team(data);
  }

  async create(payload: TeamPayload): Promise<Team> {
    const data = await sportsRequest<Team>(this.endpoint, {
      method: "POST",
      body: JSON.stringify(sanitizePayload(payload)),
    });
    return new Team(data);
  }

  async update(id: number, payload: TeamPayload): Promise<Team> {
    const data = await sportsRequest<Team>(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(sanitizePayload(payload)),
    });
    return new Team(data);
  }

  async activate(id: number): Promise<Team> {
    const data = await sportsRequest<Team>(`${this.endpoint}/${id}/activate`, {
      method: "PATCH",
    });
    return new Team(data);
  }

  async deactivate(id: number): Promise<Team> {
    const data = await sportsRequest<Team>(`${this.endpoint}/${id}/deactivate`, {
      method: "PATCH",
    });
    return new Team(data);
  }

  async remove(id: number): Promise<void> {
    await sportsRequest<void>(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
  }
}
