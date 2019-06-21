import { parse, toSeconds } from 'iso8601-duration';
import { Link } from '../types/Link';
import { Playback, StreamPlayback, YoutubePlayback } from '../types/Playback';

const convertPlaybackResource = (
  rawPlayback,
): StreamPlayback | YoutubePlayback => {
  if (!['STREAM', 'YOUTUBE'].includes(rawPlayback.type)) {
    throw new Error(`Playback type ${rawPlayback.type} not supported`);
  }

  const playback: Playback = {
    type: rawPlayback.type,
    id: rawPlayback.id,
    thumbnailUrl: rawPlayback.thumbnailUrl,
    duration: toSeconds(parse(rawPlayback.duration)),
    links: {},
  };
  if (rawPlayback._links) {
    playback.links.createPlaybackEvent = new Link(
      rawPlayback._links.createPlaybackEvent,
    );
  }

  if (rawPlayback.type === 'STREAM') {
    (playback as StreamPlayback).streamUrl = rawPlayback.streamUrl;
  }

  return playback;
};

export default convertPlaybackResource;
