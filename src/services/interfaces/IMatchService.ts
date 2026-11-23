import {
  Match,
  MatchCreatePayload,
  MatchFinishPayload,
  MatchUpdatePayload,
} from "../../models/Match";

export interface IMatchService {
  getAll(): Promise<Match[]>;
  getByPhase(phaseId: number): Promise<Match[]>;
  create(phaseId: number, payload: MatchCreatePayload): Promise<Match>;
  update(id: number, payload: MatchUpdatePayload): Promise<Match>;
  remove(id: number): Promise<void>;
  start(id: number): Promise<Match | void>;
  cancel(id: number): Promise<Match | void>;
  finish(id: number, payload: MatchFinishPayload): Promise<Match | void>;
}
