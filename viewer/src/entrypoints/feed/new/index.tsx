import '../../style.css';

import { Subscription } from 'rxjs';
import * as elements from 'safe-typed-html';

import { Path } from '../';
import { Bootstrap } from '../../../bootstrap';
import { parsePath } from '../../../util/path';
import { Session } from '../../../session';
import { FeedStore } from '../../../stores/feed';

export class NewPostController {
  private readonly feedStore: FeedStore;
  private readonly subscription: Subscription;

  constructor(
    private readonly session: Session,
    private readonly address: string,
  ) {
    this.feedStore = new FeedStore();
    this.subscription = this.feedStore
      .exists(this.address)
      .subscribe(exists => {
        this.render(exists);
      });
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  render(exists: boolean) {

  }
}

window.onload = async () => {
  const bootstrap = new Bootstrap();
  const session = await bootstrap.session;
  const parsedPath: Path = parsePath('/feed/:account/new');

  console.log('Creating app with session', session, parsedPath);
  if (session.user.loggedIn) {
    console.log('Logged in');
    if (parsedPath.account !== session.user.addr) {
      window.location.replace(`/feed/${parsedPath.account}`);
    }

    window.feed = new NewPostController(session, parsedPath.account);
  } else {
    console.log('Not logged in');
    window.location.replace(`/feed/${parsedPath.account}`);
  }
};