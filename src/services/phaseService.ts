import { FinalRound, GroupTeam, Phase, PhaseType } from "../models/Phase";
import { IPhaseService } from "./interfaces/IPhaseService";
import { sportsRequest } from "./sportsHttp";

export function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
}

export function toText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toPhaseType(value: unknown): PhaseType {
  return value === "GROUP" ? "GROUP" : "FINAL";
}

function toFinalRound(value: unknown): FinalRound | null | undefined {
  if (typeof value !== "string") return value === null ? null : undefined;
  const normalized = value.trim().toUpperCase();
  const allowed: FinalRound[] = [
    "ROUND_OF_16",
    "QUARTERFINAL",
    "SEMIFINAL",
    "THIRD_PLACE",
    "FINAL",
  ];
  return allowed.includes(normalized as FinalRound)
    ? (normalized as FinalRound)
    : undefined;
}

export function toGroupTeam(dto: any): GroupTeam | null {
  const id = toNumber(dto?.id ?? dto?.teamId ?? dto?.team_id ?? dto?.team?.id);
  if (!id || id < 1) return null;
  const name =
    toText(dto?.name ?? dto?.teamName ?? dto?.team?.name ?? dto?.nombre) ??
    `Equipo #${id}`;
  const groupId = toNumber(dto?.groupId ?? dto?.group_id ?? dto?.group?.id);
  return { id, name, groupId: groupId ?? null };
}

export function toPhase(dto: any): Phase {
  const phaseType = toPhaseType(dto?.phaseType ?? dto?.phase_type ?? dto?.type);
  const teams = Array.isArray(dto?.teams)
    ? dto.teams.map(toGroupTeam).filter((team): team is GroupTeam => team !== null)
    : undefined;

  return {
    id: toNumber(dto?.id) ?? 0,
    name: toText(dto?.name) ?? (phaseType === "GROUP" ? "Grupo" : "Final"),
    order: toNumber(dto?.order ?? dto?.phaseOrder ?? dto?.phase_order) ?? 0,
    tournamentId:
      toNumber(dto?.tournamentId ?? dto?.tournament_id ?? dto?.tournament?.id) ??
      null,
    phaseType,
    finalRound: toFinalRound(dto?.finalRound ?? dto?.final_round),
    teams,
  };
}

export class PhaseService implements IPhaseService {
  private readonly endpoint = "/phases";

  async getAll(tournamentId?: number): Promise<Phase[]> {
    const params = new URLSearchParams();
    if (tournamentId !== undefined) {
      params.set("tournamentId", String(tournamentId));
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<any[]>(path);
    return Array.isArray(data) ? data.map(toPhase) : [];
  }
}
