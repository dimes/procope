import { logIn } from '@onflow/fcl';

import { qs } from './util/dom';
import { Session } from './session';

export class HeaderController {
  constructor(
    public readonly session: Session,
  ) {
    this.render();
  }

  render() {
    const header = qs('#header')!;
    header.style.display = '';

    const me = qs<HTMLButtonElement>(header, '.me')!;
    const login = qs<HTMLButtonElement>(header, '.login')!;
    const logout = qs<HTMLButtonElement>(header, '.logout')!;

    if (this.session.user.loggedIn) {
      login.classList.add('hidden');
      login.onclick = null;

      logout.classList.remove('hidden');
      if (!logout.onclick) {
        logout.onclick = () => {
          this.session.user.logout();
        }
      }

      me.classList.remove('hidden');
      if (!me.onclick) {
        me.onclick = () => {
          window.location.href = `/feed/${this.session.user.addr}`;
        };
      }
    } else {
      login.classList.remove('hidden');
      if (!login.onclick) {
        login.onclick = () => {
          logIn();
        }
      }

      logout.classList.add('hidden');
      logout.onclick = null;

      me.classList.add('hidden');
      me.onclick = null;
    }
  }
}