import {
  Tournament,
  TournamentPayload,
  TournamentQueryFilters,
} from "../models/Tournament";
import { TournamentOverview } from "../models/TournamentOverview";
import { ITournamentService } from "./interfaces/ITournamentService";
import { sportsRequest } from "./sportsHttp";

function sanitizePayload(payload: TournamentPayload): TournamentPayload {
  return {
    name: payload.name.trim(),
    sportId: Number(payload.sportId),
    startDate: payload.startDate,
    enrollmentDeadline: payload.enrollmentDeadline,
  };
}

export class TournamentService implements ITournamentService {
  private readonly endpoint = "/tournaments";

  async getAll(filters?: TournamentQueryFilters): Promise<Tournament[]> {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) {
      params.set("active", String(filters.active));
    }
    if (filters?.sportId !== undefined) {
      params.set("sportId", String(filters.sportId));
    }
    if (filters?.name && filters.name.trim().length > 0) {
      params.set("name", filters.name.trim());
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<Tournament[]>(path);
    return Array.isArray(data) ? data.map((t) => new Tournament(t)) : [];
  }

  async getById(id: number): Promise<Tournament> {
    const data = await sportsRequest<Tournament>(`${this.endpoint}/${id}`);
    return new Tournament(data);
  }

  async create(payload: TournamentPayload): Promise<Tournament> {
    const data = await sportsRequest<Tournament>(this.endpoint, {
      method: "POST",
      body: JSON.stringify(sanitizePayload(payload)),
    });
    return new Tournament(data);
  }

  async update(id: number, payload: TournamentPayload): Promise<Tournament> {
    const data = await sportsRequest<Tournament>(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(sanitizePayload(payload)),
    });
    return new Tournament(data);
  }

  async activate(id: number): Promise<Tournament> {
    const data = await sportsRequest<Tournament>(`${this.endpoint}/${id}/activate`, {
      method: "PATCH",
    });
    return new Tournament(data);
  }

  async deactivate(id: number): Promise<Tournament> {
    const data = await sportsRequest<Tournament>(
      `${this.endpoint}/${id}/deactivate`,
      { method: "PATCH" },
    );
    return new Tournament(data);
  }

  async remove(id: number): Promise<void> {
    await sportsRequest<void>(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
  }

  async getOverview(id: number): Promise<TournamentOverview> {
    const data = await sportsRequest<TournamentOverview>(
      `${this.endpoint}/${id}/overview`,
    );
    return new TournamentOverview(data);
  }
}
