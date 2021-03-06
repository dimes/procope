import { User as fclUser } from '@onflow/fcl';

export class User {
  get addr(): string | null {
    return this.fclUser.addr;
  }

  get loggedIn(): boolean {
    return this.fclUser.loggedIn ?? false;
  }

  constructor(
    public readonly fclUser: fclUser,
    public readonly logout: () => void,
  ) { }
}