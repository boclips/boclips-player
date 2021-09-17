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
      'settings',
    ],
    addons: {
      seekPreview: true,
      hoverPreview: false,
      singlePlayback: true,
      videoLengthPreview: true,
    },
  },
});

player
  .loadVideo('https://api.boclips.com/v1/videos/5c54d7cfd8eafeecae20ef1d')
  // .then(() => {
  //   return player.play();
  // })
  // .then(() => {
  //   setTimeout(() => {
  //     player.pause();
  //   }, 10000);
  // });
