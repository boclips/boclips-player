import { Player } from '../BoclipsPlayer';
import { defaultOptions } from '../PlayerOptions';

// noinspection JSUnusedGlobalSymbols
export const BoclipsPlayer = jest.fn().mockImplementation(() => {
  return {
    destroy: jest.fn(),
    loadVideo: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
    getPlayerId: jest.fn(),
    getOptions: jest.fn().mockReturnValue(defaultOptions),
  } as Player;
});
