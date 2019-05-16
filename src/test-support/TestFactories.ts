import { Source } from '../Provider/Provider';

export class SourceFactory {
  public static sample = (): Source => ({
    poster: '/path/to/poster.jpg',
    title: 'new title',
    type: 'video',
    sources: [
      {
        provider: 'html5',
        src: '/path/to/video.mp4',
      },
    ],
  });
}
