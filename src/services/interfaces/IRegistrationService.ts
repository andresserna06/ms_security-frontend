import { Registration, RegistrationCreatePayload } from "../../models/Registration";

export interface IRegistrationService {
  getByTournament(tournamentId: number): Promise<Registration[]>;
  create(
    tournamentId: number,
    payload: RegistrationCreatePayload,
  ): Promise<Registration>;
  withdraw(tournamentId: number, teamId: number): Promise<Registration | void>;
  confirm(tournamentId: number, teamId: number): Promise<Registration | void>;
}
