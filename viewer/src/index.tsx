import { Bootstrap } from './bootstrap';
import { FeedController } from './feed';
import { LoginController } from './login';

window.onload = async () => {
  const bootstrap = new Bootstrap();
  const session = await bootstrap.session;

  console.log('Creating app with session', session);
  if (session.user.loggedIn) {
    console.log('Logged in');
    window.feed = new FeedController(session);
  } else {
    console.log('Not logged in');
    window.login = new LoginController(session);
  }
};