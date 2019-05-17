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

Plyr.prototype.on = on;
Plyr.prototype.__callEventCallback = __callEventCallback;

module.exports = Plyr;
