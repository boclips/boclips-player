import { WrapperFactory } from './WrapperFactory';

import PlyrWrapper from './Plyr/PlyrWrapper';

it('Returns a Plyr', () => {
  const wrapper = WrapperFactory.get();
  expect(wrapper).toEqual(PlyrWrapper);
});
