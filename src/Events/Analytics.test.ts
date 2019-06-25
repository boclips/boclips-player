import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
import { BoclipsPlayer } from '../BoclipsPlayer/BoclipsPlayer';
import { VideoFactory } from '../test-support/TestFactories';
import { noop } from '../utils';
import { Analytics } from './Analytics';

jest.mock('../BoclipsClient/AxiosBoclipsClient');
jest.mock('../BoclipsPlayer/BoclipsPlayer');

let analytics: Analytics;
const video = VideoFactory.sample();

let boclipsPlayer: MaybeMocked<BoclipsPlayer>;

beforeEach(() => {
  boclipsPlayer = mocked(new BoclipsPlayer(null, null));
  analytics = new Analytics(boclipsPlayer);
  analytics.configure(video);
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
    analytics.configure(video);

    analytics.handlePlay(5);
    analytics.handlePause(20);

    expect(boclipsPlayer.getClient().emitPlaybackEvent).toHaveBeenCalled();

    const call = mocked(boclipsPlayer.getClient().emitPlaybackEvent).mock
      .calls[0];
    expect(call).toEqual([video, 5, 20, {}]);
  });

  it('will pass through the metadata to the endpoint', () => {
    const metadata = {
      testing: '123',
      someId: 'abc',
    };

    boclipsPlayer.getOptions.mockReturnValue({
      analytics: {
        metadata,
        handleOnSegmentPlayback: noop,
      },
    } as any);

    analytics = new Analytics(boclipsPlayer);
    analytics.configure(video);

    analytics.handlePlay(10);
    analytics.handlePause(25);

    expect(boclipsPlayer.getClient().emitPlaybackEvent).toHaveBeenCalled();

    const call = mocked(boclipsPlayer.getClient().emitPlaybackEvent).mock
      .calls[0];
    expect(call).toEqual([video, 10, 25, metadata]);
  });
});

describe('handleOnSegmentPlayback', () => {
  it('does emit an event to the callback', () => {
    const spy = jest.fn();

    boclipsPlayer.getOptions.mockReturnValue({
      analytics: {
        handleOnSegmentPlayback: spy,
      },
    } as any);

    analytics = new Analytics(boclipsPlayer);
    analytics.configure(video);

    analytics.handlePlay(15);
    analytics.handlePause(30);

    expect(spy).toHaveBeenCalled();

    const call = spy.mock.calls[0];
    expect(call).toEqual([video, 15, 30]);
  });
});
