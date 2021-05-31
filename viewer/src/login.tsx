import { logIn } from '@onflow/fcl';
import * as elements from 'safe-typed-html';

import { ensureEl, qs } from './util/dom';
import { Session } from './session';

export class LoginController implements ILogin {
  constructor(
    public readonly session: Session,
  ) {
    if (session.user.loggedIn) {
      throw new Error('Cannot create login controller with logged in user');
    }

    this.render();
  }

  render() {
    const main = qs('#main')!;
    const loginContainer = ensureEl(
      main,
      'login',
      () => {
        const div = document.createElement('div');
        div.innerHTML = (<div>
          <button>Login</button>
        </div>).toString();
        return div;
      },
    );

    const loginButton = qs(loginContainer, 'button')!;
    if (!loginButton.onclick) {
      loginButton.onclick = () => {
        logIn();
      };
    }
  }
}