export interface PlayerPayload {
  userId: number;
  document: string;
  position?: string;
  jerseyNumber?: number;
}

export interface PlayerQueryFilters {
  active?: boolean;
  all?: boolean;
  document?: string;
  position?: string;
}

export class Player {
  id!: number;
  userId!: number;
  document!: string;
  position?: string | null;
  jerseyNumber?: number | null;
  active!: boolean;

  constructor(data?: Partial<Player>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
