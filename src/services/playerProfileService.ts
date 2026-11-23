import { PlayerProfile } from "../models/PlayerProfile";
import { IPlayerProfileService } from "./interfaces/IPlayerProfileService";
import { sportsRequest } from "./sportsHttp";

export class PlayerProfileService implements IPlayerProfileService {
  async getByPlayerId(playerId: number): Promise<PlayerProfile> {
    const data = await sportsRequest<PlayerProfile>(
      `/players/${playerId}/profile`,
    );
    return new PlayerProfile(data);
  }
}
