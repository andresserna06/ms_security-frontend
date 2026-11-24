import {
  Tournament,
  TournamentPayload,
  TournamentQueryFilters,
} from "../../models/Tournament";
import { TournamentOverview } from "../../models/TournamentOverview";

export interface ITournamentService {
  getAll(filters?: TournamentQueryFilters): Promise<Tournament[]>;
  getById(id: number): Promise<Tournament>;
  create(payload: TournamentPayload): Promise<Tournament>;
  update(id: number, payload: TournamentPayload): Promise<Tournament>;
  activate(id: number): Promise<Tournament>;
  deactivate(id: number): Promise<Tournament>;
  remove(id: number): Promise<void>;
  getOverview(id: number): Promise<TournamentOverview>;
}
