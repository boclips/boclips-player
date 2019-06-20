import { mocked } from 'ts-jest';
import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { AxiosBoclipsClient } from '../BoclipsClient/AxiosBoclipsClient';
import { BoclipsClient } from '../BoclipsClient/BoclipsClient';
import { VideoFactory } from '../test-support/TestFactories';
import { Analytics } from './Analytics';
import { AnalyticsOptions } from './AnalyticsOptions';

jest.mock('../BoclipsClient/AxiosBoclipsClient');

let analytics: Analytics;
const video = VideoFactory.sample();

let boclipsClient: MaybeMocked<BoclipsClient>;

beforeEach(() => {
  boclipsClient = mocked(new AxiosBoclipsClient());
  analytics = new Analytics(boclipsClient, '321');
  analytics.configure(video);
});

it('can handle play events', () => {
  analytics.handlePlay(15);

  expect(analytics.getSegmentPlaybackStartTime()).toEqual(15);
});

it('does nothing on pause events before a play event', () => {
  analytics.handlePause(20);

  expect(boclipsClient.createPlaybackEvent).not.toHaveBeenCalled();
});

describe('will emit a playback event on pause after a play event', () => {
  it('can handle pause events once a play event has been handled', () => {
    analytics.configure(video);

    analytics.handlePlay(5);
    analytics.handlePause(20);

    expect(boclipsClient.createPlaybackEvent).toHaveBeenCalled();

    const call = boclipsClient.createPlaybackEvent.mock.calls[0];
    expect(call[0]).toEqual(video);
    expect(call[1]).toMatchObject({
      segmentStartSeconds: 5,
      segmentEndSeconds: 20,
      videoDurationSeconds: 60,
      videoId: video.id,
      playerId: '321',
    });
  });

  it('will pass through the metadata to the endpoint', () => {
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        testing: '123',
        someId: 'abc',
      },
    };
    analytics = new Analytics(boclipsClient, '321', options);
    analytics.configure(video);

    analytics.handlePlay(10);
    analytics.handlePause(25);

    expect(boclipsClient.createPlaybackEvent).toHaveBeenCalled();

    const call = boclipsClient.createPlaybackEvent.mock.calls[0];
    expect(call[0]).toEqual(video);
    expect(call[1]).toMatchObject({
      testing: '123',
      someId: 'abc',
    });
  });

  it('does not allow overriding of properties via metadata', () => {
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        segmentStartSeconds: 'abcdef',
      },
    };
    analytics = new Analytics(boclipsClient, '321', options);
    analytics.configure(video);

    analytics.handlePlay(15);
    analytics.handlePause(30);

    const call = boclipsClient.createPlaybackEvent.mock.calls[0];
    expect(call[0]).toEqual(video);
    expect(call[1]).toMatchObject({
      segmentStartSeconds: 15,
    });
  });
});

describe('handleOnPlayback', () => {
  it('does emit an event to the callback with metadata', () => {
    const spy = jest.fn();
    // @ts-ignore
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        one: 'one',
      },
      handleOnPlayback: spy,
    };
    analytics = new Analytics(new AxiosBoclipsClient(), '321', options);
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
