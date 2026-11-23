export type RegistrationStatus = "CONFIRMED" | "WITHDRAWN";

export interface Registration {
  id?: number;
  tournamentId: number;
  teamId: number;
  teamName?: string;
  tournamentName?: string;
  registeredAt?: string | null;
  withdrawnAt?: string | null;
  status?: RegistrationStatus | string;
}

export interface RegistrationCreatePayload {
  teamId: number;
}
