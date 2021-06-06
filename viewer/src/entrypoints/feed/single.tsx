import '../style.css';

import DOMPurify from 'dompurify';
import { Subscription } from 'rxjs';
import * as elements from 'safe-typed-html';
import snarkdown from 'snarkdown';

import { IndexPath } from './index';
import { Bootstrap } from '../../bootstrap';
import { FeedStore, Post } from '../../stores/feed';
import { HeaderController } from '../../header';
import { Session } from '../../session';
import template from '../../templates/feed/single.html';
import { qs } from '../../util/dom';
import { parsePath } from '../../util/path';

export class SinglePostController {
  private readonly header: HeaderController;
  private readonly feedStore: FeedStore;
  private readonly subscription: Subscription;

  constructor(
    private readonly session: Session,
    private readonly address: string,
    private readonly index: number,
  ) {
    this.header = new HeaderController(session);
    this.feedStore = new FeedStore();
    this.subscription = this.feedStore
      .fetchSingle(this.address, this.index)
      .subscribe(page => this.render(page));
    this.render(null);
  }

  private render(post: Post | null) {
    console.log('Rendering post', post);
    const main = qs('#main')!;
    main.style.display = '';

    const feedTitle = qs<HTMLAnchorElement>(main, '.feed_title a')!;
    feedTitle.innerText = this.address;
    feedTitle.href = `/feed/${this.address}`;

    if (post) {
      qs(main, '.post_title')!.innerText = post.title;
      qs(main, '.content')!.innerHTML = snarkdown(
        DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } })
      );
    }
  }
}

interface SinglePath extends IndexPath {
  index: string;
}

window.onload = async () => {
  qs('#main')!.innerHTML = template;

  const bootstrap = new Bootstrap();
  const session = await bootstrap.session;
  const parsedPath: SinglePath = parsePath('/feed/:account/:index');

  console.log('Creating app with session', session, parsedPath);
  if (session.user.loggedIn) {
    console.log('Logged in');
    const index = +parsedPath.index;
    if (isNaN(index)) {
      window.location.replace(`/feed/${parsedPath.account}`);
      return;
    }
    window.feed = new SinglePostController(session, parsedPath.account, index);
  } else {
    console.log('Not logged in');
    window.location.replace(`/feed/${parsedPath.account}`);
  }
}