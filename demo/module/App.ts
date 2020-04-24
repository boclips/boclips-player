import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);

const child = `<div id='share-icons-container'><i id="#general-button-icon" >
<svg width="18px" height="20px" viewBox="0 0 18 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="desktop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="search-results" transform="translate(-508.000000, -426.000000)">
        <g id="video-player-/-player-error" transform="translate(322.000000, 288.000000)">
            <g id="Group" transform="translate(183.000000, 136.000000)">
                <g id="Icons-/-actions-/-share">
                    <g id="round-share-24px">
                        <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                        <path d="M18,16.08 C17.24,16.08 16.56,16.38 16.04,16.85 L8.91,12.7 C8.96,12.47 9,12.24 9,12 C9,11.76 8.96,11.53 8.91,11.3 L15.96,7.19 C16.5,7.69 17.21,8 18,8 C19.66,8 21,6.66 21,5 C21,3.34 19.66,2 18,2 C16.34,2 15,3.34 15,5 C15,5.24 15.04,5.47 15.09,5.7 L8.04,9.81 C7.5,9.31 6.79,9 6,9 C4.34,9 3,10.34 3,12 C3,13.66 4.34,15 6,15 C6.79,15 7.5,14.69 8.04,14.19 L15.16,18.35 C15.11,18.56 15.08,18.78 15.08,19 C15.08,20.61 16.39,21.92 18,21.92 C19.61,21.92 20.92,20.61 20.92,19 C20.92,17.39 19.61,16.08 18,16.08 Z" id="Path" fill="#FFFFFF" fill-rule="nonzero"></path>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
</svg></i><span id="general-button-label">Share</span><div>`;

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
      rewatchButton: true,
      generalButton: {
        child,
        onClick: () => {
          console.log('pass in function');
        },
      },
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
