// @ts-ignore
window.TextTrack = jest.fn();

Object.defineProperty(HTMLElement.prototype, 'insertAdjacentElement', {
  configurable: true,
  value(_, element) {
    this.appendChild(element);
  },
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get() {
    return this.__jsdomMockClientHeight || 0;
  },
});

Object.defineProperty(window, 'addEventListener', {
  configurable: true,
  value(event, callback) {
    if (!this.callbacks) {
      // noinspection JSUnusedGlobalSymbols
      this.__callbacks = {};
    }
    if (!this.__callbacks[event]) {
      this.__callbacks[event] = [];
    }
    this.__callbacks[event].push(callback);
  },
});

Object.defineProperty(window, 'removeEventListener', {
  configurable: true,
  value(event, callback) {
    if (!this.callbacks) {
      // noinspection JSUnusedGlobalSymbols
      this.__callbacks = {};
    }
    if (!this.__callbacks[event]) {
      this.__callbacks[event] = [];
    }
    this.__callbacks[event] = this.__callbacks[event].filter(
      element => element !== callback,
    );
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: jest.fn(),
});
