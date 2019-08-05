import { noop } from '../../utils';
import { MediaPlayer } from '../MediaPlayer';

export const MockMediaPlayer = jest.fn<MediaPlayer, any>().mockImplementation(
  (): MediaPlayer => {
    return {
      configureWithVideo: jest.fn(),
      play: jest.fn().mockReturnValue(new Promise(noop)),
      pause: jest.fn(),
      destroy: jest.fn(),
    };
  },
);

// noinspection JSUnusedGlobalSymbols
export const MediaPlayerFactory = {
  get: jest.fn().mockReturnValue(MockMediaPlayer),
};
