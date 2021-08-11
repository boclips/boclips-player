export interface BoclipsAPIError {
  type: 'API_ERROR';
  message: 'Error retrieving video from API';
  statusCode: number;
}

export interface BoclipsStreamingError {
  type: 'STREAMING_ERROR';
  message:
    | 'A fatal streaming media error occured'
    | 'A fatal streaming network error occured';
}

export interface BoclipsUnknownError {
  type: 'UNKNOWN_ERROR';
  message: 'An unknown error occured';
}

export interface BoclipsPlaybackError {
  type: 'PLAYBACK_ERROR';
  message: 'A fatal playback error occured';
}

export type BoclipsError =
  | BoclipsAPIError
  | BoclipsStreamingError
  | BoclipsUnknownError
  | BoclipsPlaybackError;
