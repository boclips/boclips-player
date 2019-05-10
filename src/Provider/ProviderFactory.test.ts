import { ProviderFactory } from './ProviderFactory';

import Plyr from 'plyr';

it('Returns a Plyr', () => {
  const provider = ProviderFactory.get();
  expect(provider).toEqual(Plyr);
});
