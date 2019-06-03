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

const media = {
  addEventListener: jest.fn(),
};

Plyr.prototype.on = on;
Plyr.prototype.__callEventCallback = __callEventCallback;
Plyr.prototype.media = media;
Plyr.prototype.play = jest.fn().mockReturnValue(new Promise(noop));

module.exports = Plyr;
