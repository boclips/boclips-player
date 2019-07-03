import { BoclipsApiClient } from '../BoclipsApiClient';

// noinspection JSUnusedGlobalSymbols
export const AxiosBoclipsApiClient = jest.fn().mockImplementation(() => {
  return {
    retrieveVideo: jest.fn(),
    emitPlaybackEvent: jest.fn(),
    emitPlayerInteractionEvent: jest.fn(),
  } as BoclipsApiClient;
});
