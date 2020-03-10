import Plyr from 'plyr';
import { MaybeMocked } from 'ts-jest/dist/util/testing';
import { mocked } from 'ts-jest/utils';
import { MockedPlyr } from '../../../../../__mocks__/plyr';
import { EventBus } from '../../../../Events/EventBus';
import { SinglePlayback } from './SinglePlayback';

jest.mock('eventemitter3');

describe('Feature Enabling', () => {
  it('can be enabled when the option is true', () => {
    const actual = SinglePlayback.canBeEnabled(null, null, {
      controls: null,
      addons: {
        singlePlayback: true,
      },
    });

    expect(actual).toBe(true);
  });
  it('cannot be enabled when the option is true', () => {
    const actual = SinglePlayback.canBeEnabled(null, null, {
      controls: null,
      addons: {
        singlePlayback: false,
      },
    });

    expect(actual).toBe(false);
  });
});

describe('Functionality', () => {
  let plyr: any;

  beforeEach(() => {
    plyr = new Plyr(document.createElement('div'));

    // tslint:disable-next-line:no-unused-expression
    new SinglePlayback(plyr, null, null);
  });

  it('emits a global event when playing a video', () => {
    const eventEmitter = EventBus.getEmitter();
    expect(eventEmitter).toBeTruthy();

    plyr.__callEventCallback('playing');

    expect(eventEmitter.emit).toHaveBeenCalledWith('boclips-player/playing', {
      addonId: expect.anything(),
    });
  });

  it('pauses the plyr when it receives a global event', () => {
    const eventEmitter = EventBus.getEmitter();
    expect(eventEmitter).toBeTruthy();

    expect(eventEmitter.on).toHaveBeenCalledTimes(1);
    expect(eventEmitter.on).toHaveBeenCalledWith(
      'boclips-player/playing',
      expect.anything(),
    );

    const callback = mocked(eventEmitter.on).mock.calls[0][1];
    callback({
      addonId: 'not-a-match-for-the-target',
    });

    expect(plyr.pause).toHaveBeenCalled();
  });

  it('does not pause the plyr when it receives an event from itself', () => {
    const eventEmitter = EventBus.getEmitter();
    expect(eventEmitter).toBeTruthy();

    plyr.__callEventCallback('playing');

    const emittedEvent = mocked(eventEmitter.emit).mock.calls[0][1];

    const eventListener = mocked(eventEmitter.on).mock.calls[0][1];
    eventListener(emittedEvent);

    expect(plyr.pause).not.toHaveBeenCalled();
  });
});

describe('Destruction', () => {
  let plyr: MaybeMocked<MockedPlyr>;
  let addon: SinglePlayback;

  beforeEach(() => {
    plyr = new Plyr(document.createElement('div')) as MaybeMocked<MockedPlyr>;

    addon = new SinglePlayback(plyr, null, null);
  });

  it('Removes the event listeners from plyr', () => {
    expect(plyr.on).toHaveBeenCalled();

    addon.destroy();

    const plyrListener = plyr.on.mock.calls[0][1];
    expect(plyr.off).toHaveBeenCalledWith('playing', plyrListener);
  });

  it('Removes the event listeners from the event emitter', () => {
    const eventEmitter = EventBus.getEmitter();

    addon.destroy();

    const eventListener = mocked(eventEmitter.on).mock.calls[0][1];
    expect(eventEmitter.off).toHaveBeenCalledWith(
      'boclips-player/playing',
      eventListener,
    );
  });
});
