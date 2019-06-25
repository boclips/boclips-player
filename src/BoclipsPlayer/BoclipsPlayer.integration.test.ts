import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoResourceFactory } from '../test-support/TestFactories';
import { BoclipsPlayer } from './BoclipsPlayer';

let container: HTMLElement;
let player: BoclipsPlayer;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  player = new BoclipsPlayer(
    container,
  );
});

it('remove an error when reloading a good video', async () => {
  const errorUri = 'http://server/path/to/error/video';
  MockFetchVerify.get(errorUri, {}, 404);

  const goodUri = 'http://server/path/to/video';
  MockFetchVerify.get(goodUri, VideoResourceFactory.streamSample());

  await player.loadVideo(errorUri);
  expect(container.querySelector('.error')).toBeTruthy();

  // User "oh no!"
  await player.loadVideo(goodUri);
  expect(container.querySelector('.error')).toBeFalsy();
});
