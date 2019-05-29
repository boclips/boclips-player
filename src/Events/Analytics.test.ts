import eventually from '../test-support/eventually';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { VideoFactory } from '../test-support/TestFactories';
import { Analytics } from './Analytics';
import { AnalyticsOptions } from './AnalyticsOptions';

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

it('does nothing on pause events before a play event', () => {
  analytics.handlePause(20);

  const history = MockFetchVerify.getHistory();
  expect(history).toBeTruthy();
});

describe('will emit a playback event on pause after a play event', () => {
  beforeEach(() => {
    MockFetchVerify.post('create/playback/event', undefined, 201);
  });

  it('can handle pause events once a play event has been handled', () => {
    analytics = new Analytics('321');
    analytics.configure(video);

    analytics.handlePlay(5);
    analytics.handlePause(20);

    return eventually(() => {
      const history = MockFetchVerify.getHistory();
      const actual = JSON.parse(history.post[0].data);

      expect(actual).toMatchObject({
        segmentStartSeconds: 5,
        segmentEndSeconds: 20,
        videoDurationSeconds: 60,
        videoId: video.id,
        playerId: '321',
      });
    });
  });

  it('will pass through the metadata to the endpoint', () => {
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        testing: '123',
        someId: 'abc',
      },
    };
    analytics = new Analytics('321', options);
    analytics.configure(video);

    analytics.handlePlay(10);
    analytics.handlePause(25);

    return eventually(() => {
      const history = MockFetchVerify.getHistory();
      const actual = JSON.parse(history.post[0].data);

      expect(actual).toMatchObject({
        testing: '123',
        someId: 'abc',
      });
    });
  });

  it('does not allow overriding of properties via metadata', () => {
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        segmentStartSeconds: 'abcdef',
      },
    };
    analytics = new Analytics('321', options);
    analytics.configure(video);

    analytics.handlePlay(15);
    analytics.handlePause(30);

    return eventually(() => {
      const history = MockFetchVerify.getHistory();
      const actual = JSON.parse(history.post[0].data);

      expect(actual.segmentStartSeconds).toEqual(15);
    });
  });
});

describe('handleOnPlayback', () => {
  it('does emit an event to the callback with metadata', () => {
    const spy = jest.fn();
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        one: 'one',
      },
      handleOnPlayback: spy,
    };
    analytics = new Analytics('321', options);
    analytics.configure(video);

    analytics.handlePlay(15);
    analytics.handlePause(30);

    expect(spy).toHaveBeenCalled();

    const event = spy.mock.calls[0][0];
    expect(event).toBeTruthy();
    expect(event).toMatchObject({
      one: 'one',
      segmentStartSeconds: 15,
    });
  });
});
