import { BoclipsClient } from '../BoclipsClient';

// noinspection JSUnusedGlobalSymbols
export const AxiosBoclipsClient = jest.fn().mockImplementation(() => {
  return {
    retrieveVideo: jest.fn(),
    emitPlaybackEvent: jest.fn(),
  } as BoclipsClient;
});
