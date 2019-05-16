import eventually from '../test-support/eventually';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoFactory } from '../test-support/TestFactories';
import { EventTracker } from './EventTracker';

let eventTracker: EventTracker;
const video = VideoFactory.sample();

beforeEach(() => {
  eventTracker = new EventTracker('321');
  eventTracker.configure(video);
});

it('can handle play events', () => {
  eventTracker.handlePlay(15);

  expect(eventTracker.getSegmentPlaybackStartTime()).toEqual(15);
});

it('can handle pause events once a play event has been handled', async done => {
  MockFetchVerify.post('create/playback/event', undefined, 201);
  eventTracker = new EventTracker('321');
  eventTracker.configure(video);

  eventTracker.handlePlay(5);
  eventTracker.handlePause(20);

  await eventually(() => {
    const history = MockFetchVerify.getHistory();
    const actual = JSON.parse(history.post[0].data);
    expect(actual).toEqual({
      segmentStartSeconds: 5,
      segmentEndSeconds: 20,
      videoId: video.id,
      playerId: '321',
    });

    done();
  });
});

it('does nothing on pause events before a play event', () => {
  eventTracker.handlePause(20);

  const history = MockFetchVerify.getHistory();
  expect(history).toBeTruthy();
});
