export class Skill {
  id!: number;
  name!: string;
  description!: string;

  constructor(data?: Partial<Skill>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
