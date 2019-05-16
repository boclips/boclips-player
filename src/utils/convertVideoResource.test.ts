import { streamVideoSample } from '../test-support/video-service-responses';
import convertPlaybackResource from './convertPlaybackResource';
import convertVideoResource from './convertVideoResource';

jest.mock('./convertPlaybackResource');

it('maps the data to a Video', () => {
  const videoResource = streamVideoSample;

  const video = convertVideoResource(videoResource);

  expect(convertPlaybackResource).toHaveBeenCalledWith(videoResource.playback);
  expect(video.id).toEqual(videoResource.id);
});
