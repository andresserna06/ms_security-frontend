import { Skill } from "../models/Skill";
import { ISkillService } from "./interfaces/ISkillService";
import { sportsRequest } from "./sportsHttp";

export class SkillService implements ISkillService {
  private readonly endpoint = "/skills";

  async getAll(name?: string): Promise<Skill[]> {
    const params = new URLSearchParams();
    if (name && name.trim().length > 0) {
      params.set("name", name.trim());
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<Skill[]>(path);
    return Array.isArray(data) ? data.map((s) => new Skill(s)) : [];
  }
}
