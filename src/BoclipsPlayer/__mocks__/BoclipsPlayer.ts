import { AxiosBoclipsClient } from '../../BoclipsClient/AxiosBoclipsClient';
import { Player } from '../BoclipsPlayer';
import { defaultOptions } from '../PlayerOptions';

// noinspection JSUnusedGlobalSymbols
export const BoclipsPlayer = jest.fn().mockImplementation(() => {
  const player = {
    destroy: jest.fn(),
    loadVideo: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
    getPlayerId: jest.fn(),
    getOptions: jest.fn().mockReturnValue(defaultOptions),
    getContainer: jest.fn(),
    getClient: null,
  } as Player;

  const client = new AxiosBoclipsClient(player);

  player.getClient = () => client;

  return player;
});
