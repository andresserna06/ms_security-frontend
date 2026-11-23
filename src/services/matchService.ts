import {
  Match,
  MatchCreatePayload,
  MatchFinishPayload,
  MatchResultPayload,
  MatchStatus,
  MatchUpdatePayload,
} from "../models/Match";
import { IMatchService } from "./interfaces/IMatchService";
import { sportsRequest } from "./sportsHttp";

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function toNullableNumber(value: unknown): number | null {
  const parsed = toNumber(value);
  return parsed === undefined ? null : parsed;
}

function toStatus(value: unknown): MatchStatus {
  const status = typeof value === "string" ? value.toUpperCase() : "";
  if (status === "IN_PROGRESS" || status === "FINISHED" || status === "CANCELLED") {
    return status;
  }
  return "SCHEDULED";
}

function toText(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

function toMatch(dto: any): Match {
  return {
    id: toNumber(dto?.id) ?? 0,
    scheduledAt: toText(dto?.scheduledAt ?? dto?.scheduled_at),
    status: toStatus(dto?.status),
    homeScore: toNullableNumber(dto?.homeScore ?? dto?.home_score),
    awayScore: toNullableNumber(dto?.awayScore ?? dto?.away_score),
    homeTeamId: toNullableNumber(dto?.homeTeamId ?? dto?.home_team_id ?? dto?.homeTeam?.id),
    awayTeamId: toNullableNumber(dto?.awayTeamId ?? dto?.away_team_id ?? dto?.awayTeam?.id),
    phaseId: toNumber(dto?.phaseId ?? dto?.phase_id ?? dto?.phase?.id) ?? 0,
  };
}

function buildCreatePayload(payload: MatchCreatePayload): MatchCreatePayload {
  const body: MatchCreatePayload = { scheduledAt: payload.scheduledAt };
  if (payload.homeTeamId !== undefined) body.homeTeamId = Number(payload.homeTeamId);
  if (payload.awayTeamId !== undefined) body.awayTeamId = Number(payload.awayTeamId);
  return body;
}

function buildUpdatePayload(payload: MatchUpdatePayload): MatchUpdatePayload {
  const body: MatchUpdatePayload = {};
  if (payload.scheduledAt !== undefined) body.scheduledAt = payload.scheduledAt;
  if (payload.phaseId !== undefined) body.phaseId = Number(payload.phaseId);
  if (payload.homeTeamId !== undefined) body.homeTeamId = Number(payload.homeTeamId);
  if (payload.awayTeamId !== undefined) body.awayTeamId = Number(payload.awayTeamId);
  return body;
}

export class MatchService implements IMatchService {
  async getAll(): Promise<Match[]> {
    const data = await sportsRequest<any[]>("/matches");
    return Array.isArray(data) ? data.map(toMatch) : [];
  }

  async getByPhase(phaseId: number): Promise<Match[]> {
    const data = await sportsRequest<any[]>(`/phases/${phaseId}/matches`);
    return Array.isArray(data) ? data.map(toMatch) : [];
  }

  async create(phaseId: number, payload: MatchCreatePayload): Promise<Match> {
    const data = await sportsRequest<any>(`/phases/${phaseId}/matches`, {
      method: "POST",
      body: JSON.stringify(buildCreatePayload(payload)),
    });
    return toMatch(data);
  }

  async update(id: number, payload: MatchUpdatePayload): Promise<Match> {
    const data = await sportsRequest<any>(`/matches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(buildUpdatePayload(payload)),
    });
    return toMatch(data);
  }

  async remove(id: number): Promise<void> {
    await sportsRequest<void>(`/matches/${id}`, { method: "DELETE" });
  }

  async start(id: number): Promise<Match | void> {
    const data = await sportsRequest<any>(`/matches/${id}/start`, { method: "PATCH" });
    if (data && typeof data === "object") return toMatch(data);
    return undefined;
  }

  async saveResult(id: number, payload: MatchResultPayload): Promise<Match | void> {
    const data = await sportsRequest<any>(`/matches/${id}/result`, {
      method: "PUT",
      body: JSON.stringify({
        homeScore: Number(payload.homeScore),
        awayScore: Number(payload.awayScore),
      }),
    });
    if (data && typeof data === "object") return toMatch(data);
    return undefined;
  }

  async finish(id: number, payload: MatchFinishPayload): Promise<Match | void> {
    const data = await sportsRequest<any>(`/matches/${id}/finish`, {
      method: "PATCH",
      body: JSON.stringify({
        homeScore: Number(payload.homeScore),
        awayScore: Number(payload.awayScore),
      }),
    });
    if (data && typeof data === "object") return toMatch(data);
    return undefined;
  }
}
