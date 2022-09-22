import {TitleOverlay} from "./TitleOverlay";
import Plyr from "plyr";
import {SinglePlayback} from "../SinglePlayback/SinglePlayback";
import {EventBus} from "../../../../Events/EventBus";
import {mocked} from "ts-jest/utils";

describe('Feature Enabling', () => {
    it('can be enabled when the option is true', () => {
        const actual = TitleOverlay.isEnabled(null, null, {
            controls: null,
            addons: {
                titleOverlay: true,
            },
        });

        expect(actual).toBe(true);
    });
    it('cannot be enabled when the option is true', () => {
        const actual = TitleOverlay.isEnabled(null, null, {
            controls: null,
            addons: {
                titleOverlay: false,
            },
        });

        expect(actual).toBe(false);
    });
});

describe(`displaying overlay`, () => {
    let plyr: any;

    beforeEach(() => {
        plyr = new Plyr(document.createElement('div'));

        new TitleOverlay();
    });

    it('shows the title overlay when controls visible', () => {
        const eventEmitter = EventBus.getEmitter();
        expect(eventEmitter).toBeTruthy();

        plyr.toggleControls(true)

        expect(eventEmitter.emit).toHaveBeenCalledWith('boclips-player/playing', {
            addonId: expect.anything(),
        });
    });

    it('hides title overlay when controls hidden', () => {
        const eventEmitter = EventBus.getEmitter();
        expect(eventEmitter).toBeTruthy();

        expect(eventEmitter.on).toHaveBeenCalledTimes(1);
        expect(eventEmitter.on).toHaveBeenCalledWith(
            'boclips-player/playing',
            expect.anything(),
        );

        const callback = mocked(eventEmitter.on).mock.calls[0][1];
        callback({
            addonId: 'not-a-match-for-the-target',
        });

        expect(plyr.pause).toHaveBeenCalled();
    });
})