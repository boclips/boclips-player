import { BoclipsClient } from '../BoclipsClient';

// noinspection JSUnusedGlobalSymbols
export const AxiosBoclipsClient = jest.fn().mockImplementation(() => {
  return {
    retrieveVideo: jest.fn(),
    createPlaybackEvent: jest.fn(),
  } as BoclipsClient;
});
