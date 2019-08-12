import axios from 'axios';
import AxiosLogger from 'axios-logger';
import MockFetchVerify from './MockFetchVerify';
import { HasEventListeners } from './types';

beforeEach(() => {
  (axios.interceptors.request as any).handlers = [];
  (axios.interceptors.request as any).use(AxiosLogger.requestLogger);

  MockFetchVerify.clear();

  // Can you believe JEST doesn't automatically clean up?
  document.body.innerHTML = '';
  ((window as any) as HasEventListeners).clearEventListeners();
});
