import {
  FinalPhaseCreatePayload,
  FinalPhaseUpdatePayload,
  FinalRound,
  getFinalRoundLabel,
  Phase,
} from "../models/Phase";
import { IFinalPhaseService } from "./interfaces/IFinalPhaseService";
import { sportsRequest } from "./sportsHttp";
import { toPhase } from "./phaseService";

function resolveFinalName(finalRound: FinalRound, name?: string): string {
  return getFinalRoundLabel(finalRound) || name?.trim() || "Final";
}

export class FinalPhaseService implements IFinalPhaseService {
  private readonly endpoint = "/finals";

  async getByTournament(tournamentId?: number): Promise<Phase[]> {
    const params = new URLSearchParams();
    if (tournamentId !== undefined) {
      params.set("tournamentId", String(tournamentId));
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<any[]>(path);
    return Array.isArray(data)
      ? data.map((item) => ({ ...toPhase(item), phaseType: "FINAL" as const }))
      : [];
  }

  async getById(id: number): Promise<Phase> {
    const data = await sportsRequest<any>(`${this.endpoint}/${id}`);
    return { ...toPhase(data), phaseType: "FINAL" };
  }

  async create(payload: FinalPhaseCreatePayload): Promise<Phase> {
    const data = await sportsRequest<any>(this.endpoint, {
      method: "POST",
      body: JSON.stringify({
        name: resolveFinalName(payload.finalRound, payload.name),
        order: Number(payload.order),
        tournamentId: Number(payload.tournamentId),
        finalRound: payload.finalRound,
      }),
    });
    return { ...toPhase(data), phaseType: "FINAL" };
  }

  async update(id: number, payload: FinalPhaseUpdatePayload): Promise<Phase> {
    const body: FinalPhaseUpdatePayload = {};
    if (payload.order !== undefined) body.order = Number(payload.order);
    if (payload.finalRound !== undefined) {
      body.finalRound = payload.finalRound;
      body.name = resolveFinalName(payload.finalRound, payload.name);
    } else if (payload.name !== undefined) {
      body.name = payload.name.trim();
    }
    const data = await sportsRequest<any>(`${this.endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return { ...toPhase(data), phaseType: "FINAL" };
  }

  async remove(id: number): Promise<void> {
    await sportsRequest<void>(`${this.endpoint}/${id}`, { method: "DELETE" });
  }
}
