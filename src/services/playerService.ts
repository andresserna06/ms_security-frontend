import { Player, PlayerPayload, PlayerQueryFilters } from "../models/Player";
import { IPlayerService } from "./interfaces/IPlayerService";
import { sportsRequest } from "./sportsHttp";

function sanitizePayload(payload: PlayerPayload): PlayerPayload {
  const body: PlayerPayload = {
    userId: Number(payload.userId),
    document: payload.document.trim(),
  };

  if (payload.position !== undefined && payload.position.trim().length > 0) {
    body.position = payload.position.trim();
  }

  if (payload.jerseyNumber !== undefined && !Number.isNaN(Number(payload.jerseyNumber))) {
    body.jerseyNumber = Number(payload.jerseyNumber);
  }

  return body;
}

export class PlayerService implements IPlayerService {
  private readonly endpoint = "/players";

  async getAll(filters?: PlayerQueryFilters): Promise<Player[]> {
    const params = new URLSearchParams();

    if (filters?.all) {
      params.set("all", "true");
    } else if (filters?.active !== undefined) {
      params.set("active", String(filters.active));
    }

    if (filters?.document && filters.document.trim().length > 0) {
      params.set("document", filters.document.trim());
    }

    if (filters?.position && filters.position.trim().length > 0) {
      params.set("position", filters.position.trim());
    }

    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<Player[]>(path);
    return Array.isArray(data) ? data.map((p) => new Player(p)) : [];
  }

  async getById(id: number): Promise<Player> {
    const data = await sportsRequest<Player>(`${this.endpoint}/${id}`);
    return new Player(data);
  }

  async create(payload: PlayerPayload): Promise<Player> {
    const data = await sportsRequest<Player>(this.endpoint, {
      method: "POST",
      body: JSON.stringify(sanitizePayload(payload)),
    });
    return new Player(data);
  }

  async update(id: number, payload: PlayerPayload): Promise<Player> {
    const data = await sportsRequest<Player>(`${this.endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(sanitizePayload(payload)),
    });
    return new Player(data);
  }

  async activate(id: number): Promise<Player> {
    const data = await sportsRequest<Player>(`${this.endpoint}/${id}/activate`, {
      method: "PATCH",
    });
    return new Player(data);
  }

  async deactivate(id: number): Promise<Player> {
    const data = await sportsRequest<Player>(`${this.endpoint}/${id}/deactivate`, {
      method: "PATCH",
    });
    return new Player(data);
  }

  async remove(id: number): Promise<void> {
    await sportsRequest<void>(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
  }
}
