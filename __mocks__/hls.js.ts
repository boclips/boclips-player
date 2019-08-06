const RealHls = jest.requireActual('hls.js');

const Hls: any = jest.genMockFromModule('hls.js');

function __callEventCallback(event, payload) {
  if (!this.callbacksMap) {
    this.callbacksMap = {};
  }

  const callbacks = this.callbacksMap[event] || [];
  callbacks.forEach(callback => callback(event, payload));
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

Hls.prototype.on = on;
Hls.prototype.__callEventCallback = __callEventCallback;
Hls.Events = RealHls.Events;
Hls.ErrorTypes = RealHls.ErrorTypes;
Hls.ErrorDetails = RealHls.ErrorDetails;
Hls.isSupported = jest.fn().mockReturnValue(true);

module.exports = Hls;
