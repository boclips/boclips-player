import { BoclipsAPIError } from './../ErrorHandler/BoclipsPlayerError';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoResourceFactory } from '../test-support/TestFactories';
import { BoclipsPlayer } from './BoclipsPlayer';

jest.unmock('plyr');

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

it('remove an error when reloading a good video', async () => {
  const player = new BoclipsPlayer(container);
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

it('calls a passed in error handler when something goes wrong', async () => {
  const onErrorCallback = jest.fn();
  const player = new BoclipsPlayer(container);
  player.onError(onErrorCallback);

  const errorUri = 'http://server/path/to/error/video';
  MockFetchVerify.get(errorUri, {}, 404);

  await player.loadVideo(errorUri);

  const expectedError: BoclipsAPIError = {
    type: 'API_ERROR',
    message: 'Error retrieving video from API',
    statusCode: 404,
  };

  expect(onErrorCallback).toHaveBeenCalledWith(expectedError);
});

it('calls an on ready callback when the video is ready', async () => {
  const onReadyCallback = jest.fn();
  const player = new BoclipsPlayer(container);
  player.onReady(onReadyCallback);

  const validUri = 'http://server/path/to/video';
  MockFetchVerify.get(validUri, VideoResourceFactory.streamSample(), 200);

  await player.loadVideo(validUri);
  expect(onReadyCallback).toHaveBeenCalled();
});

it('does not call the on ready callback when the video is not ready', async () => {
  const onReadyCallback = jest.fn();
  const player = new BoclipsPlayer(container);
  player.onReady(onReadyCallback);

  const validUri = 'http://server/path/to/video';
  MockFetchVerify.get(validUri, {}, 500);

  await player.loadVideo(validUri);
  expect(onReadyCallback).toHaveBeenCalledTimes(0);
});

it('can handle a when there is no on ready callback', async () => {
  const onErrorCallback = jest.fn();
  const player = new BoclipsPlayer(container);
  player.onError(onErrorCallback);

  const validUri = 'http://server/path/to/video';
  const resource = VideoResourceFactory.streamSample();
  MockFetchVerify.get(validUri, resource, 200);

  await player.loadVideo(validUri);
  expect(player.getVideo().id).toEqual(resource.id);
  expect(onErrorCallback).toHaveBeenCalledTimes(0);
});

it('can handle a when there is the wrong type of callback is passed in', async () => {
  const onErrorCallback = jest.fn();
  const player = new BoclipsPlayer(container);
  player.onError(onErrorCallback);
  player.onReady('hello' as any);

  const validUri = 'http://server/path/to/video';
  const resource = VideoResourceFactory.streamSample();
  MockFetchVerify.get(validUri, resource, 200);

  await player.loadVideo(validUri);
  expect(player.getVideo().id).toEqual(resource.id);
  expect(onErrorCallback).toHaveBeenCalledTimes(0);
});
