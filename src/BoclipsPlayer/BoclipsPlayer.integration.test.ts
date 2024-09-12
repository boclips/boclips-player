import { BoclipsAPIError } from './../ErrorHandler/BoclipsPlayerError';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoResourceFactory } from '../test-support/TestFactories';
import { BoclipsPlayer } from './BoclipsPlayer';
import {  expect, beforeEach, it, jest } from '@jest/globals';


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

