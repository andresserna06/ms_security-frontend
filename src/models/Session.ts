export class Session {
  accessToken?: string;
  tokenType?: string;
  expiresAt?: string;
  email?: string;
  message?: string;

  constructor(data?: Partial<Session>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

