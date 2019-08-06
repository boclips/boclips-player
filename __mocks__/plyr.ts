import { noop } from '../src/utils';

const Plyr: any = jest.genMockFromModule('plyr');

function __callEventCallback(event) {
  if (!this.callbacksMap) {
    this.callbacksMap = {};
  }

  const callbacks = this.callbacksMap[event] || [];
  callbacks.forEach(callback =>
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
    item => item !== callback,
  );
}

const media = {
  addEventListener: jest.fn(),
};

Plyr.prototype.on = on;
Plyr.prototype.off = off;
Plyr.prototype.__callEventCallback = __callEventCallback;
Plyr.prototype.media = media;
Plyr.prototype.play = jest.fn().mockReturnValue(new Promise(noop));

module.exports = Plyr;
