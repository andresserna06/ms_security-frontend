import {
  FinishMatchPayload,
  Match,
  UpdateMatchResultPayload,
} from "../../models/Match";
import { ScoringEvent, ScoringEventPayload } from "../../models/ScoringEvent";

export interface IMatchResultService {
  getAllMatches(): Promise<Match[]>;
  getMatchById(id: number): Promise<Match>;
  updateResult(
    matchId: number,
    payload: UpdateMatchResultPayload,
  ): Promise<Match>;
  finishMatch(matchId: number, payload?: FinishMatchPayload): Promise<Match>;
  getScoringEvents(matchId: number): Promise<ScoringEvent[]>;
  createScoringEvent(
    matchId: number,
    payload: ScoringEventPayload,
  ): Promise<ScoringEvent>;
  updateScoringEvent(
    eventId: number,
    payload: ScoringEventPayload,
  ): Promise<ScoringEvent>;
  deleteScoringEvent(eventId: number): Promise<void>;
}
