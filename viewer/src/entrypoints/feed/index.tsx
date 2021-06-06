import '../style.css';
import './common.css';

import DOMPurify from 'dompurify';
import { Subscription } from 'rxjs';
import * as elements from 'safe-typed-html';
import snarkdown from 'snarkdown';

import { Bootstrap } from '../../bootstrap';
import { qs } from '../../util/dom';
import { FeedPage, FeedStore } from '../../stores/feed';
import { HeaderController } from '../../header';
import { Session } from '../../session';
import template from '../../templates/feed/index.html';
import { parsePath } from '../../util/path';

const PAGE_SIZE = 16;

export class FeedController {
  private readonly header: HeaderController;
  private readonly feedStore: FeedStore;
  private readonly subscription: Subscription;

  constructor(
    private readonly session: Session,
    private readonly address: string,
    private readonly page: number,
  ) {
    this.header = new HeaderController(session);
    this.feedStore = new FeedStore();
    this.subscription = this.feedStore
      .fetchFeed(this.address, this.page)
      .subscribe(page => this.render(page));
    this.render(null);
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  private render(page: FeedPage | null) {
    console.log('Rendering feed page', page);
    const main = qs('#main')!;
    main.style.display = '';

    const feedContainer = qs(main, '.feed_container')!;
    qs(feedContainer, '.feed_title')!.innerText = this.address;

    if (this.address === this.session.user.addr) {
      const newButton = qs(feedContainer, '.feed_title_container .new')!;
      newButton.classList.remove('hidden');
      if (!newButton.onclick) {
        newButton.onclick = () => {
          window.location.href = `/feed/${this.address}/new`;
        }
      }
    }

    const posts = page?.posts?.reverse() ?? [];
    const feedItems = posts.map((item, i) => (<div class={`feed_item mt-10 ${i === 0 ? '' : 'pt-10 border-t'}`}>
      <h2 class="text-3xl"><a href={`/feed/${this.address}/${(this.page * PAGE_SIZE) + (posts.length - i - 1)}`}>
        {item.title}
      </a></h2>
      <div class="content mt-3"
        dangerousInnerHtml={snarkdown(DOMPurify.sanitize(item.content, { USE_PROFILES: { html: true } }))}>
      </div>
    </div>).toString());
    qs(feedContainer, '.feed_items')!.innerHTML = feedItems.join('');
  }
}

export interface IndexPath {
  account: string;
}

window.onload = async () => {
  qs('#main')!.innerHTML = template;

  const bootstrap = new Bootstrap();
  const session = await bootstrap.session;
  const parsedPath: IndexPath = parsePath('/feed/:account');

  console.log('Creating app with session', session, parsedPath);
  window.feed = new FeedController(session, parsedPath.account, 0);
};
