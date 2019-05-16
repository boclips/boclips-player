import axios from 'axios';
import AxiosLogger from 'axios-logger';
import MockFetchVerify from './MockFetchVerify';

// @ts-ignore
window.TextTrack = jest.fn();

if (typeof HTMLElement.prototype.insertAdjacentElement === 'undefined') {
  Object.defineProperty(HTMLElement.prototype, 'insertAdjacentElement', {
    value(_, element) {
      this.appendChild(element);
    },
  });
}

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  value: jest.fn(),
});

console.log = s => {
  process.stdout.write(s + '\n');
};
console.debug = s => {
  process.stdout.write(s + '\n');
};

beforeEach(() => {
  (axios.interceptors.request as any).handlers = [];
  (axios.interceptors.request as any).use(AxiosLogger.requestLogger);

  MockFetchVerify.clear();
});
