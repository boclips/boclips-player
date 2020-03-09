import EventEmitter from 'eventemitter3';

interface BoclipsPlayerEvents {
  'boclips-player/playing': [
    {
      addonId: string;
    },
  ];
}
const eventEmitter = new EventEmitter<BoclipsPlayerEvents>();

export class EventBus {
  public static getEmitter = () => {
    return eventEmitter;
  };
}
