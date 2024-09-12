import { BoclipsApiClient } from '../BoclipsApiClient';
import {VideoFactory} from "../../test-support/TestFactories";

import { jest } from '@jest/globals';


// noinspection JSUnusedGlobalSymbols
export const AxiosBoclipsApiClient = jest.fn().mockImplementation(() => {
  return {
    retrieveVideo: jest.fn(() => Promise.resolve(VideoFactory.sample())),
    emitPlaybackEvent: jest.fn(),
    emitPlayerInteractionEvent: jest.fn(),
  } as BoclipsApiClient;
});
