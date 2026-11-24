export interface TeamPayload {
  name: string;
  city: string;
  contactEmail: string;
  foundedYear?: number;
  // Crest as an image data URL (base64); omitted on update removes it.
  logo?: string;
}

export interface TeamQueryFilters {
  active?: boolean;
}

export class Team {
  id!: number;
  name!: string;
  city!: string;
  contactEmail?: string;
  foundedYear?: number | null;
  logo?: string | null;
  active!: boolean;

  constructor(data?: Partial<Team>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
