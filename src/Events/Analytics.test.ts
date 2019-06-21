import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
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
  analytics = new Analytics(boclipsClient);
  analytics.configure(video);
});

it('can handle play events', () => {
  analytics.handlePlay(15);

  expect(analytics.getSegmentPlaybackStartTime()).toEqual(15);
});

it('does nothing on pause events before a play event', () => {
  analytics.handlePause(20);

  expect(boclipsClient.emitPlaybackEvent).not.toHaveBeenCalled();
});

describe('will emit a playback event on pause after a play event', () => {
  it('can handle pause events once a play event has been handled', () => {
    analytics.configure(video);

    analytics.handlePlay(5);
    analytics.handlePause(20);

    expect(boclipsClient.emitPlaybackEvent).toHaveBeenCalled();

    const call = boclipsClient.emitPlaybackEvent.mock.calls[0];
    expect(call).toEqual([video, 5, 20, {}]);
  });

  it('will pass through the metadata to the endpoint', () => {
    const options: Partial<AnalyticsOptions> = {
      metadata: {
        testing: '123',
        someId: 'abc',
      },
    };
    analytics = new Analytics(boclipsClient, options);
    analytics.configure(video);

    analytics.handlePlay(10);
    analytics.handlePause(25);

    expect(boclipsClient.emitPlaybackEvent).toHaveBeenCalled();

    const call = boclipsClient.emitPlaybackEvent.mock.calls[0];
    expect(call).toEqual([video, 10, 25, options.metadata]);
  });
});

describe('handleOnSegmentPlayback', () => {
  it('does emit an event to the callback', () => {
    const spy = jest.fn();
    const options: Partial<AnalyticsOptions> = {
      handleOnSegmentPlayback: spy,
    };

    analytics = new Analytics(new AxiosBoclipsClient(), options);
    analytics.configure(video);

    analytics.handlePlay(15);
    analytics.handlePause(30);

    expect(spy).toHaveBeenCalled();

    const call = spy.mock.calls[0];
    expect(call).toEqual([video, 15, 30]);
  });
});
