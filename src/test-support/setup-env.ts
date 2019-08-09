(window as any).TextTrack = jest.fn();

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

const eventTargets = [window, HTMLElement.prototype];

eventTargets.forEach(target => {
  Object.defineProperty(target, 'addEventListener', {
    configurable: true,
    value(event, callback) {
      if (!this.__eventListeners) {
        // noinspection JSUnusedGlobalSymbols
        this.__eventListeners = {};
      }
      if (!this.__eventListeners[event]) {
        this.__eventListeners[event] = [];
      }
      this.__eventListeners[event].push(callback);
    },
  });

  Object.defineProperty(target, 'removeEventListener', {
    configurable: true,
    value(event, callback) {
      if (!this.__eventListeners) {
        // noinspection JSUnusedGlobalSymbols
        this.__eventListeners = {};
      }
      if (!this.__eventListeners[event]) {
        this.__eventListeners[event] = [];
      }
      this.__eventListeners[event] = this.__eventListeners[event].filter(
        element => element !== callback,
      );
    },
  });
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLElement.prototype, 'setBoundingClientRect', {
  configurable: true,
  value: (domRect: DOMRect) => {
    this.__boundingClientRect = domRect;
  },
});

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: () => {
    return this.__boundingClientRect;
  },
});
