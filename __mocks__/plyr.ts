import { noop } from '../src/utils';

const Plyr: any = jest.genMockFromModule('plyr');

// tslint:disable-next-line ban-types
const callbacksMap: { [event: string]: Function[] } = {};

function __callEventCallback(event, payload) {
  const callbacks = callbacksMap[event] || [];
  callbacks.forEach(callback => callback(payload));
}

function on(event, callback) {
  if (!callbacksMap[event]) {
    callbacksMap[event] = [];
  }
  callbacksMap[event].push(callback);
}

function off(event, callback) {
  callbacksMap[event] = callbacksMap[event].filter(item => item !== callback);
}

function __destroy() {
  Object.keys(callbacksMap).forEach(key => delete callbacksMap[key]);
}

const media = {
  addEventListener: jest.fn(),
};

Plyr.prototype.on = on;
Plyr.prototype.off = off;
Plyr.prototype.__callEventCallback = __callEventCallback;
Plyr.prototype.media = media;
Plyr.prototype.play = jest.fn().mockReturnValue(new Promise(noop));
Plyr.prototype.destroy = __destroy;

module.exports = Plyr;
