import { ProviderConstructor } from '../Provider/Provider';
import MockFetchVerify from '../test-support/MockFetchVerify';
import { MockProvider } from '../test-support/MockProvider';
import { videoPlaybackSample } from '../test-support/video-service-responses';
import { BoclipsPlayer } from './BoclipsPlayer';

describe('BoclipsPlayer', () => {
  const providerConstructor = MockProvider;
  let container: HTMLElement;
  let player: BoclipsPlayer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    player = new BoclipsPlayer(
      providerConstructor as ProviderConstructor,
      container,
    );
  });

  it('Constructs a new player when passed an element', () => {
    expect(player).not.toBeNull();
  });

  it('Will return the container', () => {
    expect(player.getContainer()).toEqual(container);
  });

  it('Will return the provider', () => {
    expect(player.getProvider().play).toBeTruthy();
  });

  it('Will insert a video element into the container', () => {
    expect(container.children.length).toEqual(1);
    const child = container.children.item(0);
    expect(child.tagName).toEqual('VIDEO');
    expect(child.getAttribute('data-qa')).toEqual('boclips-player');
  });

  it('Will initialise the video element with the player', () => {
    expect(providerConstructor).toBeCalledTimes(1);
    expect(providerConstructor).toHaveBeenCalledWith(
      container.children.item(0),
    );
  });

  const illegalContainers: Array<{
    message: string;
    illegalContainer: any;
  }> = [
    {
      message: 'null',
      illegalContainer: null,
    },
    {
      message: 'an unattached div',
      illegalContainer: document.createElement('div'),
    },
    {
      message: 'a string',
      illegalContainer: 'hello',
    },
    {
      message: 'a number',
      illegalContainer: 123,
    },
  ];

  illegalContainers.forEach(({ message, illegalContainer }) => {
    it('Will throw an exception if the container ' + message, () => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new BoclipsPlayer(providerConstructor, illegalContainer);
      }).toThrow(Error);
    });
  });

  it('Will throw an exception if the providerConstructor is null', () => {
    expect(() => {
      // tslint:disable-next-line: no-unused-expression
      new BoclipsPlayer(null, container);
    }).toThrow(Error);
  });

  it('Will retrieve details from the Playback endpoint', () => {
    const uri = '/v1/videos/177/playback';
    MockFetchVerify.get(uri, JSON.stringify({ playback: videoPlaybackSample }));

    // MockFetchVerify.post(
    //     uri,
    //     undefined,
    //     201,
    //     JSON.stringify(videoPlaybackSample),
    // );

    return player.configure(uri).then(() => {
      expect(player.getPlayback().streamUrl).toEqual(
        'https://cdn.kaltura.com/stream/147.mpd',
      );
    });
  });

  it('Will play the streamUrl in the playback object', () => {
    const uri = '/v1/videos/177/playback';

    MockFetchVerify.get(uri, JSON.stringify({ playback: videoPlaybackSample }));

    // MockFetchVerify.post(
    //     uri,
    //     undefined,
    //     201,
    //     JSON.stringify(videoPlaybackSample),
    // );

    return player.configure(uri).then(() => {
      expect(player.getProvider().source.sources[0].src).toContain(
        'https://cdn.kaltura.com/stream/147.mpd',
      );
    });
  });
});
