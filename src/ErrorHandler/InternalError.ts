export interface HLSError {
  fatal: boolean;
  type: 'NETWORK_ERROR' | 'MEDIA_ERROR' | 'MUX_ERROR' | 'OTHER_ERROR';
  payload: any;
}

export interface UnknownError {
  fatal: true;
  type: 'UNKNOWN_ERROR';
  payload: any;
}

export interface APIError {
  fatal: boolean;
  type: 'API_ERROR';
  payload: {
    statusCode: number;
  };
}

export interface PlaybackError {
  fatal: boolean;
  type: 'PLAYBACK_ERROR';
  payload: {
    code: number;
    message: string;
  };
}

export type InternalError = APIError | PlaybackError | HLSError | UnknownError;
