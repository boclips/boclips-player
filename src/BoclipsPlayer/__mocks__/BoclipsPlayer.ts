import { AxiosBoclipsApiClient } from '../../BoclipsApiClient/AxiosBoclipsApiClient';
import { ErrorHandler } from '../../ErrorHandler/ErrorHandler';
import { Analytics } from '../../Events/Analytics';
import { PrivatePlayer } from '../BoclipsPlayer';
import { defaultOptions } from '../PlayerOptions';

// noinspection JSUnusedGlobalSymbols
export const BoclipsPlayer = jest
  .fn()
  .mockImplementation((container = null, options = defaultOptions) => {
    const player = {
      destroy: jest.fn(),
      loadVideo: jest.fn(),
      pause: jest.fn(),
      play: jest.fn(),
      getVideo: jest.fn(),
      getPlayerId: jest.fn().mockReturnValue('player-id'),
      getOptions: jest.fn().mockReturnValue(options),
      getContainer: jest.fn().mockReturnValue(container),
      getClient: null,
      getAnalytics: null,
      getErrorHandler: null,
    } as PrivatePlayer;

    const client = new AxiosBoclipsApiClient(player);
    const analytics = new Analytics(player);
    const errorHandler = new ErrorHandler(player);

    player.getClient = () => client;
    player.getAnalytics = () => analytics;
    player.getErrorHandler = () => errorHandler;

    return player;
  });
