import {
  BoclipsError,
  BoclipsAPIError,
  BoclipsStreamingError,
  BoclipsUnknownError,
  BoclipsPlaybackError,
} from './BoclipsPlayerError';
import { InternalError } from './InternalError';

export const ErrorConverter = {
  convert: (error: InternalError): BoclipsError => {
    switch (error.type) {
      case 'API_ERROR': {
        return {
          message: 'Error retrieving video from API',
          statusCode: error.payload.statusCode,
          type: 'API_ERROR',
        } as BoclipsAPIError;
      }
      case 'MEDIA_ERROR': {
        return {
          message: 'A fatal streaming media error occured',
          type: 'STREAMING_ERROR',
        } as BoclipsStreamingError;
      }
      case 'NETWORK_ERROR': {
        return {
          message: 'A fatal streaming network error occured',
          type: 'STREAMING_ERROR',
        } as BoclipsStreamingError;
      }
      case 'PLAYBACK_ERROR': {
        return {
          message: 'A fatal playback error occured',
          type: 'PLAYBACK_ERROR',
        } as BoclipsPlaybackError;
      }

      default: {
        return {
          message: 'An unknown error occured',
          type: 'UNKNOWN_ERROR',
        } as BoclipsUnknownError;
      }
    }
  },
};
