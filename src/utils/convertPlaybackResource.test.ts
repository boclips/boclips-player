import convertPlaybackResource from './convertPlaybackResource';

it('Can map the response to a Playback object', () => {
  const input = {
    streamUrl: 'some/video.mp4',
  };

  expect(convertPlaybackResource(input).streamUrl).toEqual('some/video.mp4');
});
