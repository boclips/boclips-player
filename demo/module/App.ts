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
  requireLoginPage: true,
  authEndpoint: 'https://login.staging-boclips.com/auth',
});

// An example token factory
// const tokenFactory = (): Promise<string> => {
//   return fetch('your-service.com/token')
//     .then(response => response.json())
//     .then(data => data.token);
// };

function renderPlayer() {
  const player = PlayerFactory.get(playerContainer, {
    api: { tokenFactory: boclipsSecurity.getTokenFactory(5) },
    interface: {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'fullscreen',
        'settings',
      ],
      addons: {
        seekPreview: true,
        hoverPreview: false,
      },
    },
  });
  const cb = (div): void => {console.log("blah")}
  player
    .loadVideo(
      'https://api.staging-boclips.com/v1/videos/5c542abf5438cdbcb56defff',
    )
    .then(() => {
    player.onError(cb)
      return player.play();
    })
    .then(() => {
      setTimeout(() => {
        player.pause();
      }, 10000);
    });
}
