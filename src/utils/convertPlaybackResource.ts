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
    links: {
      createPlaybackEvent: new Link(rawPlayback._links.createPlaybackEvent),
      createPlayerInteractedWithEvent: new Link(
        rawPlayback._links.createPlayerInteractedWithEvent,
      ),
    },
  };

  if (rawPlayback.type === 'STREAM') {
    (playback as StreamPlayback).streamUrl = rawPlayback.streamUrl;
  }

  if (rawPlayback._links.thumbnail) {
    playback.links.thumbnail = new Link(rawPlayback._links.thumbnail);
  }

  if (rawPlayback._links.videoPreview) {
    playback.links.videoPreview = new Link(rawPlayback._links.videoPreview);
  }

  return playback;
};

export default convertPlaybackResource;
