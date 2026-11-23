import { Phase } from "../../models/Phase";

export interface IPhaseService {
  getAll(tournamentId?: number): Promise<Phase[]>;
}
