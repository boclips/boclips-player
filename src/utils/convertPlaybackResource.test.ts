import convertPlaybackResource from './convertPlaybackResource';

it('Can map the response to a Playback object', () => {
  // const input = {
  //   streamUrl: 'some/video.mp4',
  //   thumbnailUrl: 'some/image.jpg',
  // };

  const input = {
    playback: {
      streamUrl: 'some/video.mp4',
      thumbnailUrl: 'some/image.jpg',
    },
  };

  expect(convertPlaybackResource(input).streamUrl).toEqual('some/video.mp4');
  expect(convertPlaybackResource(input).thumbnailUrl).toEqual('some/image.jpg');
});
