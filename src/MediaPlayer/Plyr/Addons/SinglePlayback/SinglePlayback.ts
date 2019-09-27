import Plyr from 'plyr';
import uuid from 'uuid/v1';
import { EventBus } from '../../../../Events/EventBus';
import { InterfaceOptions } from '../../../InterfaceOptions';
import { AddonInterface } from '../Addons';

export type SinglePlaybackOptions = boolean;

export class SinglePlayback implements AddonInterface {
  public static canBeEnabled = (_, __, options: InterfaceOptions) =>
    options.addons.singlePlayback;

  private readonly addonId = uuid();

  public constructor(private readonly plyr: Plyr.Plyr, _, __) {
    this.addEventListeners();
  }

  private addEventListeners = () => {
    this.plyr.on('playing', this.handlePlyrPlaying);
    EventBus.getEmitter().on(
      'boclips-player/playing',
      this.handleEmittedPlaybackEvent,
    );
  };

  private removeEventListeners = () => {
    if (this.plyr) {
      this.plyr.off('playing', this.handlePlyrPlaying);
    }

    EventBus.getEmitter().off(
      'boclips-player/playing',
      this.handleEmittedPlaybackEvent,
    );
  };

  private handlePlyrPlaying = () => {
    EventBus.getEmitter().emit('boclips-player/playing', {
      addonId: this.addonId,
    });
  };

  private handleEmittedPlaybackEvent = payload => {
    if (payload.addonId === this.addonId) {
      return;
    }

    this.plyr.pause();
  };

  public destroy = () => {
    this.removeEventListeners();
  };
}
