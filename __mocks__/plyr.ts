import { EnrichedPlyr } from '../src/types/plyr';
import { noop } from '../src/utils';
import { jest } from '@jest/globals';

const Plyr: any = jest.createMockFromModule('plyr');

function __callEventCallback(event) {
  if (!this.callbacksMap) {
    this.callbacksMap = {};
  }

  const callbacks = this.callbacksMap[event] || [];
  callbacks.forEach((callback) =>
    callback({
      detail: { plyr: this },
    }),
  );
}

function on(event, callback) {
  if (!this.callbacksMap) {
    this.callbacksMap = {};
  }

  if (!this.callbacksMap[event]) {
    this.callbacksMap[event] = [];
  }
  this.callbacksMap[event].push(callback);
}

function off(event, callback) {
  this.callbacksMap[event] = this.callbacksMap[event].filter(
    (item) => item !== callback,
  );
}

const media = {
  addEventListener: jest.fn(),
};

Plyr.prototype.on = jest.fn(on);
Plyr.prototype.off = jest.fn(off);
Plyr.prototype.__callEventCallback = __callEventCallback;
Plyr.prototype.media = media;
Plyr.prototype.pause = jest.fn();
Plyr.prototype.play = jest.fn().mockReturnValue(new Promise(noop));
Plyr.prototype.destroy = jest.fn();
Plyr.prototype.elements = {
  container: {
    clientWidth: 700,
  },
};
Plyr.prototype.captions = { currentTrackNode: jest.fn() };

export interface MockedPlyr extends EnrichedPlyr {
  __callEventCallback: (event: string) => void;
  elements: any;
}

export default Plyr;
