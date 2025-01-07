import { VideoResourceFactory } from '../test-support/TestFactories';
import convertPlaybackResource from './convertPlaybackResource';
import convertVideoResource from './convertVideoResource';

jest.mock('./convertPlaybackResource');

it('maps the data to a Video', () => {
  const videoResource = VideoResourceFactory.streamSample();

  const video = convertVideoResource(videoResource);

  expect(convertPlaybackResource).toHaveBeenCalledWith(videoResource);
  expect(video.id).toEqual(videoResource.id);
});
