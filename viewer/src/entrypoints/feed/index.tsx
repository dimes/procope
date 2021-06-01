import '../style.css';

import { Subscription } from 'rxjs';
import * as elements from 'safe-typed-html';

import { Bootstrap } from '../../bootstrap';
import { Session } from '../../session';
import { FeedPage, FeedStore, Post } from '../../stores/feed';
import { ensureEl, qs } from '../../util/dom';
import { parsePath } from '../../util/path';

export class FeedController {
  private readonly feedStore: FeedStore;
  private readonly subscription: Subscription;

  constructor(
    private readonly session: Session,
    private readonly account: string,
  ) {
    this.feedStore = new FeedStore();
    this.subscription = this.feedStore
      .fetchFeed(this.account)
      .subscribe(feed => this.render(feed));
    this.render(null);
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  private render(page: FeedPage | null) {
    console.log('Rendering feed page', page);
    const main = qs('#main')!;
    main.style.display = '';

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

    const feedContainer = qs(main, '.feed_container')!;
    qs(feedContainer, '.feed_title')!.innerText = this.account;

    if (this.account === this.session.user.addr) {
      const newButton = qs(feedContainer, '.feed_title_container .new')!;
      newButton.classList.remove('hidden');
      if (!newButton.onclick) {
        newButton.onclick = () => {
          window.location.href = `/feed/${this.account}/new`;
        }
      }
    }

    const posts = page?.posts?.reverse() ?? [];
    const feedItems = posts.map(item => (<div class="feed_item">
      <h2>{item.title}</h2>
      <div class="content">{item.content}</div>
    </div>).toString());
    qs(feedContainer, '.feed_items')!.innerHTML = feedItems.join();
  }
}

export interface Path {
  account: string;
}

window.onload = async () => {
  const bootstrap = new Bootstrap();
  const session = await bootstrap.session;
  const parsedPath: Path = parsePath('/feed/:account');

  console.log('Creating app with session', session, parsedPath);
  if (session.user.loggedIn) {
    console.log('Logged in');
    window.feed = new FeedController(session, parsedPath.account);
  } else {
    console.log('Not logged in');
  }
};
