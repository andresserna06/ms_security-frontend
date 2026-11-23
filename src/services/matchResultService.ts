import {
  FinishMatchPayload,
  Match,
  UpdateMatchResultPayload,
} from "../models/Match";
import { ScoringEvent, ScoringEventPayload } from "../models/ScoringEvent";
import { IMatchResultService } from "./interfaces/IMatchResultService";
import { sportsRequest } from "./sportsHttp";

function sanitizeScoringEventPayload(
  payload: ScoringEventPayload,
): ScoringEventPayload {
  return {
    playerId: Number(payload.playerId),
    teamId: Number(payload.teamId),
    minute: Number(payload.minute),
    type: payload.type.trim(),
  };
}

export class MatchResultService implements IMatchResultService {
  async getAllMatches(): Promise<Match[]> {
    const data = await sportsRequest<Match[]>("/matches");
    return Array.isArray(data) ? data.map((m) => ({ ...m })) : [];
  }

  async getMatchById(id: number): Promise<Match> {
    const data = await sportsRequest<Match>(`/matches/${id}`);
    return { ...data };
  }

  async updateResult(
    matchId: number,
    payload: UpdateMatchResultPayload,
  ): Promise<Match> {
    const data = await sportsRequest<Match>(`/matches/${matchId}/result`, {
      method: "PUT",
      body: JSON.stringify({
        homeScore: Number(payload.homeScore),
        awayScore: Number(payload.awayScore),
      }),
    });
    return { ...data };
  }

  async finishMatch(
    matchId: number,
    payload?: FinishMatchPayload,
  ): Promise<Match> {
    const body: FinishMatchPayload = {};
    if (
      payload?.homeScore !== undefined &&
      !Number.isNaN(Number(payload.homeScore))
    ) {
      body.homeScore = Number(payload.homeScore);
    }
    if (
      payload?.awayScore !== undefined &&
      !Number.isNaN(Number(payload.awayScore))
    ) {
      body.awayScore = Number(payload.awayScore);
    }

    const data = await sportsRequest<Match>(`/matches/${matchId}/finish`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return { ...data };
  }

  async getScoringEvents(matchId: number): Promise<ScoringEvent[]> {
    const data = await sportsRequest<ScoringEvent[]>(
      `/matches/${matchId}/scoring-events`,
    );
    return Array.isArray(data) ? data.map((e) => new ScoringEvent(e)) : [];
  }

  async createScoringEvent(
    matchId: number,
    payload: ScoringEventPayload,
  ): Promise<ScoringEvent> {
    const data = await sportsRequest<ScoringEvent>(
      `/matches/${matchId}/scoring-events`,
      {
        method: "POST",
        body: JSON.stringify(sanitizeScoringEventPayload(payload)),
      },
    );
    return new ScoringEvent(data);
  }

  async updateScoringEvent(
    eventId: number,
    payload: ScoringEventPayload,
  ): Promise<ScoringEvent> {
    const data = await sportsRequest<ScoringEvent>(
      `/scoring-events/${eventId}`,
      {
        method: "PUT",
        body: JSON.stringify(sanitizeScoringEventPayload(payload)),
      },
    );
    return new ScoringEvent(data);
  }

  async deleteScoringEvent(eventId: number): Promise<void> {
    await sportsRequest<void>(`/scoring-events/${eventId}`, {
      method: "DELETE",
    });
  }
}
