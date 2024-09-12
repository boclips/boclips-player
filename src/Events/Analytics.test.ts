import { mocked } from 'jest-mock';
import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { VideoFactory } from '../test-support/TestFactories';
import { noop } from '../utils';
import { Analytics } from './Analytics';
import { describe, expect, beforeEach, it, jest } from '@jest/globals';
import { AxiosBoclipsApiClient } from '../BoclipsApiClient/AxiosBoclipsApiClient';

let analytics: Analytics;
const video = VideoFactory.sample();

let boclipsPlayer: BoclipsPlayer;
let boclipsClient: AxiosBoclipsApiClient;

beforeEach(() => {
  const element = document.createElement('div');
  boclipsPlayer = new BoclipsPlayer(element);
  jest.spyOn(boclipsPlayer, 'getVideo').mockReturnValue(video);
  analytics = new Analytics(boclipsPlayer);

  boclipsClient = new AxiosBoclipsApiClient(boclipsPlayer);

  jest.spyOn(boclipsPlayer, 'getClient').mockReturnValue(boclipsClient);
  jest.spyOn(boclipsClient, 'emitPlaybackEvent').mockResolvedValue();
});

it('can handle play events', () => {
  analytics.handlePlay(15);

  expect(analytics.getSegmentPlaybackStartTime()).toEqual(15);
});

it('does nothing on pause events before a play event', () => {
  analytics.handlePause(20);

  expect(boclipsPlayer.getClient().emitPlaybackEvent).not.toHaveBeenCalled();
});

describe('will emit a playback event on pause after a play event', () => {
  it('can handle pause events once a play event has been handled', () => {
    analytics.handlePlay(5);
    analytics.handlePause(20);

    expect(boclipsPlayer.getClient().emitPlaybackEvent).toHaveBeenCalled();

    const call = mocked(boclipsPlayer.getClient().emitPlaybackEvent).mock
      .calls[0];
    expect(call).toEqual([5, 20, {}]);
  });

  it('will pass through the metadata to the endpoint', () => {
    const metadata = {
      testing: '123',
      someId: 'abc',
    };

    jest.spyOn(boclipsPlayer, 'getOptions').mockReturnValue({
      analytics: {
        metadata,
        handleOnSegmentPlayback: noop,
      },
    } as any);

    analytics.handlePlay(10);
    analytics.handlePause(25);

    expect(boclipsPlayer.getClient().emitPlaybackEvent).toHaveBeenCalled();

    const call = mocked(boclipsPlayer.getClient().emitPlaybackEvent).mock
      .calls[0];
    expect(call).toEqual([10, 25, metadata]);
  });
});

describe('handleOnSegmentPlayback', () => {
  it('does emit an event to the callback', () => {
    const spy = jest.fn();

    jest.spyOn(boclipsPlayer, 'getOptions').mockReturnValue({
      analytics: {
        handleOnSegmentPlayback: spy,
      },
    } as any);

    analytics = new Analytics(boclipsPlayer);

    analytics.handlePlay(15);
    analytics.handlePause(30);

    expect(spy).toHaveBeenCalled();

    const call = spy.mock.calls[0];
    expect(call).toEqual([video, 15, 30]);
  });
});
