export class User {
  id!: number;
  name?: string;
  email?: string;

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}