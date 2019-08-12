import { parse, toSeconds } from 'iso8601-duration';
import { Link } from '../types/Link';
import {
  isStreamPlayback,
  Playback,
  StreamPlayback,
  YoutubePlayback,
} from '../types/Playback';

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

  if (rawPlayback._links.thumbnailApi) {
    playback.links.thumbnailApi = new Link(rawPlayback._links.thumbnailApi);
  } else if (
    process.env.NODE_ENV === 'development' &&
    isStreamPlayback(playback)
  ) {
    const kalturaId = playback.thumbnailUrl.replace(
      /.*\/entry_id\/([^\/]*)\/.*/,
      '$1',
    );

    playback.links.thumbnailApi = new Link({
      href: `https://cdnapisec.kaltura.com/p/1776261/thumbnail/entry_id/${kalturaId}/width/{thumbnailWidth}/vid_slices/{videoSlices}`,
      templated: true,
    });
  }

  return playback;
};

export default convertPlaybackResource;
