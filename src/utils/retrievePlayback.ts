import axios from 'axios';
import convertPlaybackResource, { Playback } from './convertPlaybackResource';

const retrievePlayback = async (uri: string): Promise<Playback> => {
  return await axios
    // .post(uri)
    .get(uri)
    .then(response => response.data)
    .then(convertPlaybackResource);

  // return new Promise(resolve => {
  //   resolve({
  //     playback: {
  //       streamUrl:
  //         'https://cdnapisec.kaltura.com/p/2394162/sp/239416200/playManifest/entryId/1_c8mlwnjb/format/applehttp/protocol/https/video.mp4',
  //       thumbnailUrl:
  //         'https://cdnapisec.kaltura.com/p/2394162/thumbnail/entry_id/1_c8mlwnjb/height/250/vid_slices/3/vid_slice/2',
  //     },
  //   });
  // });
};

export default retrievePlayback;
