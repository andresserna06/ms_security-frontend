import {
  Registration,
  RegistrationCreatePayload,
  RegistrationStatus,
} from "../models/Registration";
import { IRegistrationService } from "./interfaces/IRegistrationService";
import { sportsRequest } from "./sportsHttp";

function normalizeStatus(value: unknown): RegistrationStatus | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === "CONFIRMED" || normalized === "WITHDRAWN") {
    return normalized;
  }
  if (["ACTIVE", "REGISTERED", "ACTIVA", "INSCRITA"].includes(normalized)) {
    return "CONFIRMED";
  }
  if (["RETIRED", "CANCELLED", "CANCELED", "RETIRADA"].includes(normalized)) {
    return "WITHDRAWN";
  }
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function toText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toRegistration(dto: any, tournamentId: number): Registration | null {
  const resolvedTournamentId =
    toNumber(dto?.tournamentId ?? dto?.tournament_id ?? dto?.tournament?.id) ??
    tournamentId;
  const resolvedTeamId = toNumber(
    dto?.team?.id ?? dto?.teamId ?? dto?.team_id ?? dto?.id,
  );

  if (!resolvedTeamId || resolvedTeamId < 1) {
    return null;
  }

  return {
    id: toNumber(dto?.id ?? dto?.registrationId ?? dto?._id),
    tournamentId: resolvedTournamentId,
    teamId: resolvedTeamId,
    teamName: toText(
      dto?.team?.name ??
        dto?.teamName ??
        dto?.team_name ??
        dto?.team?.nombre ??
        dto?.name,
    ),
    tournamentName: toText(
      dto?.tournament?.name ?? dto?.tournamentName ?? dto?.tournament_name,
    ),
    registeredAt:
      toText(
        dto?.registeredAt ??
          dto?.registrationDate ??
          dto?.enrollmentDate ??
          dto?.inscriptionDate ??
          dto?.createdAt ??
          dto?.created_at ??
          dto?.date,
      ) ?? null,
    withdrawnAt:
      toText(
        dto?.withdrawnAt ??
          dto?.withdrawalDate ??
          dto?.retiredAt ??
          dto?.withdrawn_at,
      ) ?? null,
    status: normalizeStatus(dto?.status ?? dto?.registrationStatus ?? dto?.state),
  };
}

export class RegistrationService implements IRegistrationService {
  async getByTournament(tournamentId: number): Promise<Registration[]> {
    const data = await sportsRequest<any[]>(
      `/tournaments/${tournamentId}/registrations`,
    );
    return Array.isArray(data)
      ? data
          .map((item) => toRegistration(item, tournamentId))
          .filter((item): item is Registration => item !== null)
      : [];
  }

  async create(
    tournamentId: number,
    payload: RegistrationCreatePayload,
  ): Promise<Registration> {
    const data = await sportsRequest<any>(
      `/tournaments/${tournamentId}/registrations`,
      {
        method: "POST",
        body: JSON.stringify({ teamId: Number(payload.teamId) }),
      },
    );
    const registration = toRegistration(data, tournamentId);
    if (!registration) {
      return {
        tournamentId,
        teamId: Number(payload.teamId),
        status: "CONFIRMED",
      };
    }
    return registration;
  }

  async withdraw(tournamentId: number, teamId: number): Promise<Registration | void> {
    const data = await sportsRequest<any>(
      `/tournaments/${tournamentId}/registrations/${teamId}/withdraw`,
      {
        method: "PATCH",
      },
    );
    if (data && typeof data === "object") {
      const registration = toRegistration(data, tournamentId);
      return registration ?? undefined;
    }
    return undefined;
  }
}
