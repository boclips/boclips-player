import { AnalyticsInstance } from '../Analytics';

// noinspection JSUnusedGlobalSymbols
export const Analytics = jest.fn().mockImplementation(() => {
  return {
    handlePlay: jest.fn(),
    handlePause: jest.fn(),
    handleInteraction: jest.fn(),
    getSegmentPlaybackStartTime: jest.fn(),
  } as AnalyticsInstance;
});
