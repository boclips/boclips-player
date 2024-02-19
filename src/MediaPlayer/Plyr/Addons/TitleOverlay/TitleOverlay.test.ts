import { TitleOverlay } from './TitleOverlay';
import { PlaybackFactory } from '../../../../test-support/TestFactories';
import Plyr from 'plyr';
import { MockedPlyr } from '../../../../../__mocks__/plyr';

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

  it('cannot be enabled when the playback is youtube', () => {
    const actual = TitleOverlay.isEnabled(
      null,
      PlaybackFactory.youtubeSample(),
      {
        controls: null,
        addons: {
          titleOverlay: true,
        },
      },
    );

    expect(actual).toBe(false);
  });
});
jest.mock('../../../../BoclipsApiClient/AxiosBoclipsApiClient.ts');

describe(`displaying overlay`, () => {
  it(`displays title overlay on load`, async () => {
    const container = document.createElement('div') as any;

    const plyrContainer = document.createElement('div') as any;
    plyrContainer.__jsdomMockClientWidth = 700;
    container.appendChild(plyrContainer);

    const plyr = new Plyr(plyrContainer) as MockedPlyr;
    plyr.elements.container = plyrContainer;
    new TitleOverlay(plyr, PlaybackFactory.streamSample(), {
      controls: [],
      addons: {},
    });

    expect(plyrContainer.textContent).toEqual('Stream video title');
  });
});
