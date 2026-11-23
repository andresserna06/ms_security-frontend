import {
  FinalPhaseCreatePayload,
  FinalPhaseUpdatePayload,
  Phase,
} from "../../models/Phase";

export interface IFinalPhaseService {
  getByTournament(tournamentId?: number): Promise<Phase[]>;
  getById(id: number): Promise<Phase>;
  create(payload: FinalPhaseCreatePayload): Promise<Phase>;
  update(id: number, payload: FinalPhaseUpdatePayload): Promise<Phase>;
  remove(id: number): Promise<void>;
}
