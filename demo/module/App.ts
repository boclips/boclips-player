import { PlayerFactory } from '../../lib/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);

const player = PlayerFactory.get(playerContainer);

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
