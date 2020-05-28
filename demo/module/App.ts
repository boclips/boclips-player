import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);

const player = PlayerFactory.get(playerContainer, {
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
    ],
    addons: {
      seekPreview: true,
      hoverPreview: false,
      singlePlayback: true,
    },
  },
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
