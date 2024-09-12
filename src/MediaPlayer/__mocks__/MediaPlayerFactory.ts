import { noop } from '../../utils';
import { MediaPlayer, PlaybackSegment } from '../MediaPlayer';
import { mocked } from 'jest-mock';
import Plyr from 'plyr';
import { jest } from '@jest/globals';


export const MockMediaPlayer = jest.fn().mockImplementation(
  (): MediaPlayer => ({
    configureWithVideo: jest.fn(),
    play: jest.fn<() => Promise<void>>().mockReturnValue(new Promise(noop)),
    pause: jest.fn(),
    destroy: jest.fn(),
    getSegment: jest.fn<() => PlaybackSegment>(),
    getCurrentTime: jest.fn<() => number>(),
    getVideoContainer: jest.fn<() => HTMLMediaElement>(),
    onEnd: jest.fn(),
    onReady: jest.fn().mockReturnValue(mocked(Plyr)),
  }),
);

// noinspection JSUnusedGlobalSymbols
export const MediaPlayerFactory = {
  get: jest.fn().mockReturnValue(MockMediaPlayer),
};
