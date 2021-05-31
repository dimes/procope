import { currentUser } from '@onflow/fcl';

import { init as configInit } from './config';
import { Session } from './session';
import { User } from './user';

export class Bootstrap {
  public readonly session: Promise<Session>

  constructor() {
    this.session = new Promise((resolve) => {
      configInit();

      let resolved = false;
      const userProps = currentUser();
      userProps.subscribe((fclUser) => {
        if (resolved) {
          window.location.reload();
          return;
        }
        resolved = true;

        const user = new User(
          fclUser,
          userProps.unauthenticate,
        );
        const session = new Session(user);
        resolve(session);
      });
    });
  }
}