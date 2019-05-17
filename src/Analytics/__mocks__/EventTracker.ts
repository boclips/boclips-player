import { EventTrackerInstance } from '../EventTracker';

// noinspection JSUnusedGlobalSymbols
export const EventTracker = jest.fn().mockImplementation(() => {
  return {
    configure: jest.fn(),
    handlePlay: jest.fn(),
    handlePause: jest.fn(),
    getSegmentPlaybackStartTime: jest.fn(),
  } as EventTrackerInstance;
});
