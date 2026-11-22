import { Player, PlayerPayload, PlayerQueryFilters } from "../../models/Player";

export interface IPlayerService {
  getAll(filters?: PlayerQueryFilters): Promise<Player[]>;
  getById(id: number): Promise<Player>;
  create(payload: PlayerPayload): Promise<Player>;
  update(id: number, payload: PlayerPayload): Promise<Player>;
  activate(id: number): Promise<Player>;
  deactivate(id: number): Promise<Player>;
  remove(id: number): Promise<void>;
}
