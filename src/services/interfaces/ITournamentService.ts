import { Tournament } from "../../models/Tournament";

export interface ITournamentService {
  getAll(): Promise<Tournament[]>;
}
