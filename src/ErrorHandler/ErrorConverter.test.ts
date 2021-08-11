import { BoclipsAPIError } from './BoclipsPlayerError';
import { HLSError, PlaybackError } from './InternalError';
import { ErrorConverter } from './ErrorConverter';
import { APIError } from './../../lib/ErrorHandler/ErrorHandler.d';
describe('ErrorConverter', () => {
  it('converts api errors to something more meaningful', () => {
    const apiError: APIError = {
      type: 'API_ERROR',
      fatal: true,
      payload: {
        statusCode: 403,
      },
    };

    const playerError = ErrorConverter.convert(apiError) as BoclipsAPIError;
    expect(playerError.type).toEqual('API_ERROR');
    expect(playerError.message).toEqual('Error retrieving video from API');
    expect(playerError.statusCode).toEqual(403);
  });

  it('converts an HLS media error to something more meaningful', () => {
    const originalError: HLSError = {
      type: 'MEDIA_ERROR',
      fatal: true,
      payload: 'the player had a mux error',
    };

    const playerError = ErrorConverter.convert(originalError);
    expect(playerError.type).toEqual('STREAMING_ERROR');
    expect(playerError.message).toEqual(
      'A fatal streaming media error occured',
    );
  });

  it('converts an HLS network error to something more meaningful', () => {
    const originalError: HLSError = {
      type: 'NETWORK_ERROR',
      fatal: true,
      payload: 'the player had a mux error',
    };

    const playerError = ErrorConverter.convert(originalError);
    expect(playerError.type).toEqual('STREAMING_ERROR');
    expect(playerError.message).toEqual(
      'A fatal streaming network error occured',
    );
  });

  it('converts an HLS MUX error to something more meaningful', () => {
    const originalError: HLSError = {
      type: 'MUX_ERROR',
      fatal: true,
      payload: 'the player had a mux error',
    };

    const unknownError = ErrorConverter.convert(originalError);
    expect(unknownError.type).toEqual('UNKNOWN_ERROR');
    expect(unknownError.message).toEqual('An unknown error occured');
  });

  it('converts an HLS other error to an unknown error', () => {
    const otherHLSError: HLSError = {
      type: 'OTHER_ERROR',
      fatal: true,
      payload: 'the player had an other hls error',
    };

    const unknownError = ErrorConverter.convert(otherHLSError);
    expect(unknownError.type).toEqual('UNKNOWN_ERROR');
    expect(unknownError.message).toEqual('An unknown error occured');
  });

  it('converts player error to something more meaningful', () => {
    const otherHLSError: PlaybackError = {
      type: 'PLAYBACK_ERROR',
      fatal: true,
      payload: {
        message: 'bad playback error',
        code: 789015,
      },
    };

    const unknownError = ErrorConverter.convert(otherHLSError);
    expect(unknownError.type).toEqual('PLAYBACK_ERROR');
    expect(unknownError.message).toEqual('A fatal playback error occured');
  });
});
