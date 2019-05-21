import eventually from '../test-support/eventually';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoFactory } from '../test-support/TestFactories';
import { Analytics } from './Analytics';

let analytics: Analytics;
const video = VideoFactory.sample();

beforeEach(() => {
  analytics = new Analytics('321');
  analytics.configure(video);
});

it('can handle play events', () => {
  analytics.handlePlay(15);

  expect(analytics.getSegmentPlaybackStartTime()).toEqual(15);
});

it('can handle pause events once a play event has been handled', async done => {
  MockFetchVerify.post('create/playback/event', undefined, 201);
  analytics = new Analytics('321');
  analytics.configure(video);

  analytics.handlePlay(5);
  analytics.handlePause(20);

  await eventually(() => {
    const history = MockFetchVerify.getHistory();
    const actual = JSON.parse(history.post[0].data);
    expect(actual).toEqual({
      segmentStartSeconds: 5,
      segmentEndSeconds: 20,
      videoDurationSeconds: 60,
      videoId: video.id,
      playerId: '321',
    });

    done();
  });
});

it('does nothing on pause events before a play event', () => {
  analytics.handlePause(20);

  const history = MockFetchVerify.getHistory();
  expect(history).toBeTruthy();
});
