import { authenticate } from 'boclips-js-security';
import { isAuthenticated } from 'boclips-js-security/dist/src/authenticate';
import getGlobalKeycloak from 'boclips-js-security/dist/src/helpers/getGlobalKeycloak';
import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);

authenticate({
  onLogin: () => {
    console.log('Successfully authenticated');
    renderPlayer();
  },
  realm: 'boclips',
  clientId: 'teachers',
  mode: 'login-required',
  authEndpoint: 'https://login.staging-boclips.com/auth',
});

const tokenFactory = () =>
  new Promise<string>(resolve => {
    return getGlobalKeycloak()
      .updateToken(5)
      .success(() => {
        if (isAuthenticated()) {
          resolve(getGlobalKeycloak().token);
        } else {
          throw new Error('Oh no - not authenticated!');
        }
      })
      .error(() => {
        throw new Error('Fatal authentication error occurred.');
      });
  });

function renderPlayer() {
  const player = PlayerFactory.get(playerContainer, {
    boclips: { tokenFactory },
  });

  player
    .loadVideo(
      'https://teachers.staging-boclips.com/v1/videos/5c542ab85438cdbcb56ddceb',
    )
    .then(() => {
      return player.play();
    })
    .then(() => {
      setTimeout(() => {
        player.pause();
      }, 10000);
    });
}
