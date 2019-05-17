import axios from 'axios';
import AxiosLogger from 'axios-logger';
import MockFetchVerify from './MockFetchVerify';

beforeEach(() => {
  (axios.interceptors.request as any).handlers = [];
  (axios.interceptors.request as any).use(AxiosLogger.requestLogger);

  MockFetchVerify.clear();
});
