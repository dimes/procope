import '../../style.css';

import EasyMDE from 'easymde';
import { Subscription } from 'rxjs';

import { Path } from '../';
import { Bootstrap } from '../../../bootstrap';
import { HeaderController } from '../../../header';
import { Session } from '../../../session';
import { FeedStore } from '../../../stores/feed';
import template from '../../../templates/feed_new.html';
import { qs } from '../../../util/dom';
import { parsePath } from '../../../util/path';

export class NewPostController {
  private readonly header: HeaderController;
  private readonly feedStore: FeedStore;
  private readonly subscription: Subscription;

  private exists: boolean = false;
  private posting: boolean = false;
  private easyMde?: EasyMDE;

  constructor(
    private readonly session: Session,
    private readonly address: string,
  ) {
    this.header = new HeaderController(session);
    this.feedStore = new FeedStore();
    this.subscription = this.feedStore
      .exists(this.address)
      .subscribe(exists => {
        this.exists = exists;
        this.render();
      });
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  render() {
    const main = qs('#main')!;
    main.style.display = '';

    if (!this.easyMde) {
      this.easyMde = new EasyMDE({
        element: qs(main, 'textarea.content')!,
      });
    }

    const post = qs(main, 'button.post')!;
    if (!post.onclick) {
      post.onclick = async () => {
        const title = qs<HTMLInputElement>(main, 'input.title')!.value;
        if (!title) {
          window.alert('Title must be set');
          return;
        }

        const content = this.easyMde?.value();
        console.log(content);
        if (!content) {
          window.alert('Content must be set');
          return;
        }

        if (this.posting) {
          return;
        }
        this.posting = true;

        try {
          if (!this.exists) {
            await this.feedStore.initFeed();
            this.exists = true;
          }

          await this.feedStore.createPost(title, content);
        } finally {
          this.posting = false;
        }
      };
    }
  }
}

window.onload = async () => {
  qs('#main')!.innerHTML = template;

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