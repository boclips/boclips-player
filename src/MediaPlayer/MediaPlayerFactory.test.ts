import { MediaPlayerFactory } from './MediaPlayerFactory';

import PlyrWrapper from './Plyr/PlyrWrapper';

it('Returns a Plyr', () => {
  const mediaPlayer = MediaPlayerFactory.get();
  expect(mediaPlayer).toEqual(PlyrWrapper);
});
