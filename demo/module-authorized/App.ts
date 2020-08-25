
import BoclipsSecurity from 'boclips-js-security';
import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);

const boclipsSecurity = BoclipsSecurity.createInstance({
  onLogin: () => {
    console.log('Successfully authenticated');
    renderPlayer();
  },
  realm: 'boclips',
  clientId: 'teachers',
  mode: 'login-required',
  authEndpoint: 'https://login.staging-boclips.com/auth',
});

const tokenFactory = (): Promise<string> => {
  return fetch('your-service.com/token')
    .then(response => response.json())
    .then(data => data.token);
};

function renderPlayer() {
  const player = PlayerFactory.get(playerContainer, {
    api: { tokenFactory },
  });

  player
    .loadVideo(
      'https://api.staging-boclips.com/v1/videos/5c542ab85438cdbcb56ddceb',
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
