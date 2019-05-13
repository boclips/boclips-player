import { ProviderFactory } from './ProviderFactory';

import PlyrWrapper from './PlyrWrapper';

it('Returns a Plyr', () => {
  const provider = ProviderFactory.get();
  expect(provider).toEqual(PlyrWrapper);
});
