import './style.css';

import { Bootstrap } from '../bootstrap';
import { HeaderController } from '../header';
import template from '../templates/index.html';
import { qs } from '../util/dom';

window.onload = async () => {
  const main = qs('#main')!;
  main.style.display = '';
  main.innerHTML = template;

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