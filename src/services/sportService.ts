import { Sport, SportQueryFilters } from "../models/Sport";
import { ISportService } from "./interfaces/ISportService";
import { sportsRequest } from "./sportsHttp";

export class SportService implements ISportService {
  private readonly endpoint = "/sports";

  async getAll(filters?: SportQueryFilters): Promise<Sport[]> {
    const params = new URLSearchParams();
    if (filters?.all) {
      params.set("all", "true");
    } else if (filters?.active !== undefined) {
      params.set("active", String(filters.active));
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<Sport[]>(path);
    return Array.isArray(data) ? data.map((s) => new Sport(s)) : [];
  }
}
