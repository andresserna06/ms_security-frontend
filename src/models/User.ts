export class User {
  id!: number;
  name?: string;
  email?: string;
  active?: boolean;

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}