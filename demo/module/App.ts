import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);
const segments = { start: 120, end: 180 };

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
      videoLengthPreview: true,
    },
  },
  segment: segments,
});

player
  .loadVideo(
    'https://api.staging-boclips.com/v1/videos/5df9250eff99916ded943b0e',
    segments,
  )
  .then(() => {
    return player.play();
  })
  .then(() => {
    setTimeout(() => {
      player.pause();
    }, 10000);
  });
