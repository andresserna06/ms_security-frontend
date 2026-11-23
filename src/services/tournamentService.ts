import { Tournament } from "../models/Tournament";
import { ITournamentService } from "./interfaces/ITournamentService";
import { sportsRequest } from "./sportsHttp";

export class TournamentService implements ITournamentService {
  private readonly endpoint = "/tournaments";

  async getAll(): Promise<Tournament[]> {
    const data = await sportsRequest<Tournament[]>(this.endpoint);
    return Array.isArray(data) ? data.map((t) => new Tournament(t)) : [];
  }
}
