import { noop } from '../../utils';
import { MediaPlayer } from '../MediaPlayer';
import { mocked } from 'ts-jest/utils';
import Plyr from 'plyr';

export const MockMediaPlayer = jest.fn<MediaPlayer, any>().mockImplementation(
  (): MediaPlayer => ({
    configureWithVideo: jest.fn(),
    play: jest.fn().mockReturnValue(new Promise(noop)),
    pause: jest.fn(),
    destroy: jest.fn(),
    getSegment: jest.fn(),
    getCurrentTime: jest.fn(),
    getVideoContainer: jest.fn(),
    onEnd: jest.fn(),
    onReady: jest.fn().mockReturnValue(mocked(Plyr)),
  }),
);

// noinspection JSUnusedGlobalSymbols
export const MediaPlayerFactory = {
  get: jest.fn().mockReturnValue(MockMediaPlayer),
};
