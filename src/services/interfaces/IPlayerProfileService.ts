import { PlayerProfile } from "../../models/PlayerProfile";

export interface IPlayerProfileService {
  getByPlayerId(playerId: number): Promise<PlayerProfile>;
}
