import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);

const player = PlayerFactory.get(playerContainer, { playerType: 'YOUTUBE' });

player
  .loadVideo(
    'https://api.staging-boclips.com/v1/videos/5c7d0619c4347d45194e0af5',
  )
  .then(() => {
    return player.play();
  })
  .then(() => {
    setTimeout(() => {
      player.pause();
    }, 10000);
  });
