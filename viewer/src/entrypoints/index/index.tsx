import { Bootstrap } from '../../bootstrap';
import { HeaderController } from '../../header';

window.onload = async () => {
  const bootstrap = new Bootstrap();
  const session = await bootstrap.session;

  console.log('Creating app with session', session);
  if (session.user.loggedIn) {
    console.log('Logged in');
  } else {
    console.log('Not logged in');
    window.login = new HeaderController(session);
  }
};