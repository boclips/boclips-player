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

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: jest.fn(),
});
