export class Team {
  id!: number;
  name!: string;
  city!: string;
  contactEmail?: string;
  foundedYear?: number | null;
  active!: boolean;

  constructor(data?: Partial<Team>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
