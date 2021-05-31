import * as elements from 'safe-typed-html';

import { Session } from './session';
import { FeedStore } from './stores/feed';
import { ensureEl, qs } from './util/dom';

export class FeedController {
  private readonly feedStore: FeedStore;

  constructor(
    private readonly session: Session,
  ) {
    this.feedStore = new FeedStore();
    this.feedStore.fetchFeed('0x01cf0e2f2f715450').then(res => console.log(res));
    this.render();
  }

  render() {
    const main = qs('#main')!;
    const logoutContainer = ensureEl(
      main,
      'logout',
      () => {
        const div = document.createElement('div');
        div.innerHTML = (<div>
          <button>Logout</button>
        </div>).toString();
        return div;
      },
    );

    const logoutButton = qs(logoutContainer, 'button')!;
    if (!logoutButton.onclick) {
      logoutButton.onclick = () => {
        this.session.user.logout();
      }
    }
  }
}
