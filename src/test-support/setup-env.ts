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

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return this.__jsdomMockClientWidth || 700;
  },
});

Object.defineProperty(HTMLImageElement.prototype, 'onload', {
  configurable: true,
  set(callback) {
    this.__onload = callback;
  },
  get() {
    return this.__onload;
  },
});

const eventTargets = [window, HTMLElement.prototype];

eventTargets.forEach(target => {
  const originalAddEventListener = target.addEventListener;
  const originalRemoveEventListener = target.removeEventListener;

  Object.defineProperty(target, 'addEventListener', {
    configurable: true,
    value(event, callback) {
      originalAddEventListener.call(this, event, callback);
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
      originalRemoveEventListener.call(this, event, callback);
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

  Object.defineProperty(target, 'clearEventListeners', {
    configurable: true,
    value() {
      // noinspection JSUnusedGlobalSymbols
      this.__eventListeners = {};
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
