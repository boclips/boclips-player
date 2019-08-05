const RealHls = jest.requireActual('hls.js');

const Hls: any = jest.genMockFromModule('hls.js');

// tslint:disable-next-line ban-types
const callbacksMap: { [event: string]: Function[] } = {};

function __callEventCallback(event, payload) {
  const callbacks = callbacksMap[event] || [];
  callbacks.forEach(callback => callback(event, payload));
}

function on(event, callback) {
  if (!callbacksMap[event]) {
    callbacksMap[event] = [];
  }
  callbacksMap[event].push(callback);
}

Hls.prototype.on = on;
Hls.prototype.__callEventCallback = __callEventCallback;
Hls.Events = RealHls.Events;
Hls.ErrorTypes = RealHls.ErrorTypes;
Hls.isSupported = jest.fn().mockReturnValue(true);

module.exports = Hls;
