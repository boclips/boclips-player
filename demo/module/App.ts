import { PlayerFactory } from '../../src/index';

const playerContainer = document.createElement('div');
playerContainer.id = 'player-container';

document.body.appendChild(playerContainer);
const child = `<svg width="20px" height="14px" viewBox="0 0 20 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<!-- Generator: sketchtool 63.1 (101010) - https://sketch.com -->
<title>9CC91328-06C0-48A7-979F-6CFEE91BE2A5</title>
<desc>Created with sketchtool.</desc>
<g id="desktop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="search-results" transform="translate(-380.000000, -429.000000)">
        <g id="video-player-/-player-error" transform="translate(322.000000, 288.000000)">
            <g id="Group-2" transform="translate(56.000000, 136.000000)">
                <g id="Icons-/-actions-/-save">
                    <g id="round-playlist_add-24px">
                        <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                        <path d="M13,9 L3,9 C2.45,9 2,9.45 2,10 C2,10.55 2.45,11 3,11 L13,11 C13.55,11 14,10.55 14,10 C14,9.45 13.55,9 13,9 Z M13,5 L3,5 C2.45,5 2,5.45 2,6 C2,6.55 2.45,7 3,7 L13,7 C13.55,7 14,6.55 14,6 C14,5.45 13.55,5 13,5 Z M18,13 L18,10 C18,9.45 17.55,9 17,9 C16.45,9 16,9.45 16,10 L16,13 L13,13 C12.45,13 12,13.45 12,14 C12,14.55 12.45,15 13,15 L16,15 L16,18 C16,18.55 16.45,19 17,19 C17.55,19 18,18.55 18,18 L18,15 L21,15 C21.55,15 22,14.55 22,14 C22,13.45 21.55,13 21,13 L18,13 Z M3,15 L9,15 C9.55,15 10,14.55 10,14 C10,13.45 9.55,13 9,13 L3,13 C2.45,13 2,13.45 2,14 C2,14.55 2.45,15 3,15 Z" id="Shape" fill="#FAFAFF" fill-rule="nonzero"></path>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
</svg></i><span id="general-button-label">Save</span>`;
const child1 = `
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
</svg><span id="general-button-label">Share</span>`;

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
      generalButtons: [
        {
          child,
          onClick: () => {
            console.log('wo');
          },
        },
        {
          child: child1,
          onClick: () => {
            console.log('wo');
          },
        },
      ],
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
