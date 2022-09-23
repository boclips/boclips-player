import { TitleOverlay } from './TitleOverlay';
import { mocked } from 'ts-jest/utils';
import {
  PlaybackFactory,
  VideoFactory,
} from '../../../../test-support/TestFactories';
import { MaybeMocked } from 'ts-jest/dist/utils/testing';
import { BoclipsApiClient } from '../../../../BoclipsApiClient/BoclipsApiClient';
import { BoclipsPlayer } from '../../../../BoclipsPlayer/BoclipsPlayer';
import { AxiosBoclipsApiClient } from '../../../../BoclipsApiClient/AxiosBoclipsApiClient';
import { HasClientDimensions } from '../../../../test-support/types';

describe('Feature Enabling', () => {
  it('can be enabled when the option is true and title is set', () => {
    const actual = TitleOverlay.isEnabled(
      null,
      PlaybackFactory.streamSample({ title: 'not null title' }),
      {
        controls: null,
        addons: {
          titleOverlay: true,
        },
      },
    );

    expect(actual).toBe(true);
  });

  it('cannot be enabled when the option is false', () => {
    const actual = TitleOverlay.isEnabled(
      null,
      PlaybackFactory.streamSample({ title: 'not null title' }),
      {
        controls: null,
        addons: {
          titleOverlay: false,
        },
      },
    );

    expect(actual).toBe(false);
  });

  it('cannot be enabled when the title is null', () => {
    const actual = TitleOverlay.isEnabled(
      null,
      PlaybackFactory.streamSample({ title: null }),
      {
        controls: null,
        addons: {
          titleOverlay: true,
        },
      },
    );

    expect(actual).toBe(false);
  });

  it('cannot be enabled when the playback is null', () => {
    const actual = TitleOverlay.isEnabled(null, null, {
      controls: null,
      addons: {
        titleOverlay: true,
      },
    });

    expect(actual).toBe(false);
  });
});
jest.mock('../../../../BoclipsApiClient/AxiosBoclipsApiClient.ts');

describe(`displaying overlay`, () => {
  let player: BoclipsPlayer;
  let boclipsClient: MaybeMocked<BoclipsApiClient>;
  beforeEach(() => {
    const plyrContainer = document.createElement('div') as HTMLDivElement &
      HasClientDimensions;
    player = new BoclipsPlayer(plyrContainer, {
      debug: false,
      api: {},
      analytics: {},
      interface: {
        addons: {
          seekPreview: false,
          titleOverlay: true,
        },
      },
    });
    boclipsClient = mocked(AxiosBoclipsApiClient).mock.results[0].value;
  });

  it(`displays title overlay on load`, async () => {
    boclipsClient.retrieveVideo.mockResolvedValue(
      VideoFactory.sample(PlaybackFactory.streamSample(), 'amazing video'),
    );

    await player.loadVideo('/v1/videos/amazing-video');

    expect(player.getContainer().innerHTML).toContain('amazing video');
  });

  it(`displays title overlay on controls shown`, () => {});
  it(`hides title overlay on controls hidden`, () => {});
});
