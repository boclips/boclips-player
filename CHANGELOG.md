# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.0.1] - 2025-07-09

- Switch to pnpm for package management

## [10.0.0] - 2025-07-09

- Update dependencies:
  - Bump axios to 1.10.0
  - Bump uuid to 11.1.0
- Update dev dependencies:
  - Bump boclips-js-security to 15.0.1
  - Bump jest to 29.7.0
  - Bump ts-jest to 29.4.0
  - Bump typescript to 5.8.3
- Adding dependencies:
  - Added @types/node 24.0.12
  - Added jest-environment-jsdom 29.7.0

## [9.0.1] - 2025-05-19

- Support scaling of video when max-height is set on container

## [9.0.0] - 2025-02-03

- Bump node version to 22.13.1 LTS

## [8.0.1] - 2025-01-08

- Revert bumps to hls.js and eventemitter3

## [8.0.0] - 2025-01-07

- **BREAKING** Revert webpack -> vite migration and keep player event updates

## [7.16.1] - 2024-12-09

- Bump node minor version to 20.18.0

## [7.16.0] - 2024-11-08

- Re-added `playerId` to player events

## [7.15.0] - 2024-09-27

- Update dependencies:
  - Bump axios to 1.1.7
  - Bump hls.js to 1.5.15
  - Bump iso8601-duration to 2.1.2
  - Bump sass to 1.79.3
  - Bump sass-loader to 16.0.2
  - Bump uuid to 8.3.2
  - Bump webpack-bundle-analyzer to 4.10.2
- Update dev dependencies:
  - Bump webpack-cli/serve to 2.0.5
  - Bump audit-ci to 7.1.0
  - Bump axios-mock-adapter to 2.0.0
  - Bump boclips-js-security to 13.0.1
  - Bump copy-webpack-plugin to 12.0.2
  - Bump css-loader to 7.1.2
  - Bump html-webpack-plugin to 5.6.0
  - Bump jest to 29.7.0
  - Bump mini-css-extract-plugin to 2.9.1
  - Bump prettier to 3.3.3
  - Bump prettier-package-json to 2.8.0
  - Bump source-map-loader to 5.0.0
  - Bump ts-jest to 29.2.5
  - Bump typescript to 5.6.2
  - Bump typescript-tslint-plugin to 1.0.2
  - Bump webpack to 5.95.0
  - Bump webpack-cli to 5.1.4
  - Bump webpack-dev-server to 5.1.0
  - Bump webpack-merge to 6.0.1
- Adding dependencies:
  - Added jest-mock 29.7.0
- Adding dev dependencies:
  - Added jest/globals 29.7.0
- Remove unused dependencies:
  - Removed boclips-ui/styles
  - Removed normalize.css
- Remove unused dev dependencies:
  - Removed chai
  - Removed less
  - Removed less-loader
  - Removed @types/chai
  - Removed @types/jest

## [7.14.1] - 2024-04-08

- Update vulnerable dependencies:
  - Bump follow-redirects to 1.15.6
  - Bump webpack-dev-middleware to 5.3.4
  - Bump express to 4.19.2

## [7.14.0] - 2024-03-11

- Add styling to indicate when segment is set

## [7.13.0] - 2024-02-19

- Update boclips-js-security to 12.0.4
- Update @babel/traverse to 7.23.9
- Update postcss to 8.4.35
- Update follow-redirects to 1.15.5

## [7.12.0] - 2023-10-25

- Do not set poster attribute if thumbnail link is null

## [7.11.1] - 2023-08-15

- Get rid of inifinite loop in timeUpdate event

## [7.11.0] - 2023-08-02

- Expose timeUpdate, seek, and progress events

## [7.10.3] - 2023-05-26

- Upgrade plyr to 3.7.8
- Update demos

## [7.10.2] - 2022-12-21

- Improve not displaying auto generated captions

## [7.10.1] - 2022-12-20

- Do not display auto generated captions

## [7.10.0] - 2022-11-30

- Expose plyr and video through onReady callback

## [7.9.0] - 2022-11-29

- Add onReady callback to player. This is fired when the video has loaded from Boclips' API and the plyr instance is
  stable

## [7.8.3] - 2022-11-09

- Show player controls when player is focused

## [7.8.2] - 2022-11-08

- Accessibility improvements

## [7.8.1] - 2022-10-17

- Ensure duration styling is correctly rendered

## [7.8.0] - 2022-10-13

- Fix duration styling on small player

## [7.7.0] - 2022-10-13

- Display current time and total duration rather than a countdown

## [7.6.0] - 2022-08-26

- Add title overlay addon

## [7.5.1] - 2022-08-26

- Update terser to address security vulnerability

## [7.5.0] - 2022-08-26

- Update Plyr to latest

## [7.4.1] - 2022-07-22

- Update axios package to use `>=0.21.1 < 1.0.0`

## [7.4.0] - 2022-07-21

- Update axios package to use `>=0.21.1`

## [7.3.4] - 2022-05-11

- Revert focus state change - it's unnecessary

## [7.3.3] - 2022-05-11

- Restore focus state to player

## [7.3.2] - 2022-04-11

- Export defaultAnalyticsOptions

## [7.3.1] - 2022-03-25

- Security upgrades

## [7.3.0] - 2022-03-22

- Bump boclips-security to latest

## [7.2.1] - 2022-03-11

- Fix position of volume button

## [7.2.0] - 2022-03-11

- Remove aria-labelledby from title and description

## [7.1.0] - 2022-03-10

- Further style and a11y improvements

## [7.0.6] - 2022-03-10

- Change spacing between progress bar and buttons

## [7.0.5] - 2022-03-10

- Bug fix for volume control

## [7.0.4] - 2022-03-10

- Move video progress slider above buttons
- Change video and volume slider background

## [7.0.3] - 2022-03-09

- update styling of volume
- update docs

## [7.0.2] - 2022-03-09

- Split css from js bundle

## [7.0.1] - 2022-03-09

- Emit only types when building player

## [7.0.0] - 2022-03-09

- a11y update
- use sass in a project instead of less

- ## [6.10.6] - 2022-02-03

- Patch vulnerabilities

## [6.10.5] - 2021-12-17

- Fix analytics for youtube videos

## [6.10.4] - 2021-12-09

- Rename library output back to Boclips

## [6.10.3] - 2021-12-09

- Fix issues of nested iframe playback
- Use the correct plyr way of showing Youtube player
- Fix vulnerabilities
- Update docs and demos

## [6.10.2] - 2021-09-23

- Build changes

## [6.10.1] - 2021-09-23

- Fix bug affecting videos with multiple captions

## [6.10.0] - 2021-08-24

- Add aria labelledby and describedby to plyr container

- [6.9.0] - 2021-08-24

- Prevent playback outside of segment when provided

## [6.8.0] - 2021-08-11

- Add an onError call back to the player

```
const player = PlayerFactory.get(playerContainer);
player.onError((error: BoclipsError) => {
  // do something with error

  // remove the error element from the player
  player.getErrorHandler().clearError()

  // to show a new one error message, you'll have to manipulate the DOM
});
```

## [6.7.2] - 2021-08-02

- Add tooltips to seek and buttons

## [6.6.1] - 2021-07-09

- Bump boclips-js-security

## [6.4.0] - 2021-03-03

- Hide video-length-preview when in fullscreen

## [6.3.5] - 2021-02-25

- Bump boclips-js-security

## [6.3.4] - 2021-02-24

- Make plyr's configuration resolving null-safe

## [6.3.3] - 2021-01-18

- Bump axios to fix security vulnerabilities

## [6.3.2] - 2020-11-25

- Match boolean with the name of displayAutogeneratedCaptions

## [6.3.1] - 2020-11-25

- autogenerated captions not to display

## [6.3.0] - 2020-11-25

- Add optional `videoLengthPreview` feature

## [6.2.1] - 2020-11-17

- Remove some dependencies to reduce bundle size

## [6.2.0] - 2020-10-27

- Send `Boclips-Referer` for analytics

## [6.1.0] - 2020-10-21

### Change

- `AnalyticsOptions.metadata` can contain function values which produce the needed metadata

## [6.0.5] - 2020-10-09

- Use latest boclips-js-security version

## [6.0.4] - 2020-08-29

- Add information about proper values for 'start' and 'end' fields of playback segment

## [6.0.3] - 2020-08-28

- Document how to use playback segments

## [6.0.2] - 2020-08-25

## Fixed

- Fix broken link in documentation

## [6.0.1] - 2020-07-22

### Change

- Use youtube logo from cloud storage to fix unpkg issues

### Change

- Use official YouTube controls for YouTube videos

## [5.2.0] - 2020-06-15

### Fixed

- End of video overlay overflow set to scroll.

## [5.0.0] - 2020-11-01

## Fixed

- Fix bug where only one endOfVideoOverlay can be rendered at a time

## [4.2.0] - 2020-06-01

## Fixed

- Update EndOverlay to create overlay in PlyrContainer

## [4.0.0] - 2020-05-29

## Removed

- Removed rewatch button.

## [3.0.4] - 2020-05-19

## Fix

- Fix general buttons css to work in fullscreen.

## [3.0.3] - 2020-05-11

## Fix

- We no longer deep require uuid/v1, as this has been deprecated in UUID package

## [3.0.2] - 2020-04-30

## Fix

- Youtube play svg copied to `dist/`

## [3.0.1] - 2020-04-30

## No change

- Fix release configuration

## [3.0.0] - 2020-04-30

- Remove `playerType` and display the Youtube play icon without using it for Youtube videos

## [2.9.1] - 2020-04-29

### Added

- New player option `playerType` to allow clients to request a youtube player by default

## [2.9.0] - 2020-04-27

### Changed

- YouTube videos now display the YouTube play icon

### Removed

- The play icon next to the seekbar

## [2.8.2] - 2020-04-22

### Fixed

- Centering the rewatch button text and changing text to 'watch again'

## [2.8.1] - 2020-04-21

### Fixed

- Fixing the loop when overlay container is destroyed.

## [2.8.0] - 2020-04-21

### Added

- An optional feature to enable a rewatch button that appears at the end of a video.

## [2.6.9] - 2020-04-09

### Fixed

- Fix the issue of not being able to create a new player in the same container after destroying the previous player

## [2.6.8] - 2020-03-30

### Fixed

- HoverPreview errors when the animation is running post destruction

## [2.6.7] - 2020-03-12

### Fixed

- SeekPreview & HoverPreview can now handle changing player widths, and different aspect ratios

### Added

- Ratio option for interface

## [2.6.6] - 2020-03-10

### Changed

- Upgrade dependencies

## [2.6.5] - 2020-01-17

### Added

- Added ability to send User ID in Boclips-User-Id header.

## [2.6.4] - 2019-12-04

### Removed

- Removed `playerId` parameter from events.

## [2.6.3] - 2019-11-14

### Fixed

- Playing a video with multiple captions defined would not load the first caption entry. We've fixed this as best we can,
  however it seems there is an ongoing issue with HLS. There may still be times where a caption fails to load due to timing.

## [2.6.2] - 2019-11-13

### Fixed

- Adjust padding of controls to stop them covering the play button at small sizes.

## [2.6.1] - 2019-11-12

### Fixed

- Hide default Firefox captions otherwise double captions show to the user when they enable them.

## [2.6.0] - 2019-10-01

### Added

- Ability to auto upgrade/downgrade stream quality using the new `hlsStream` which now
  contains a range of qualities that may be consumed.

## [2.5.2] - 2019-09-27

### Fixed

- Be even more careful, plyr does not guard against removing listeners after destruction.

## [2.5.1] - 2019-09-27

### Fixed

- Be careful during destruction of Addons on SPAs where the parent elements have disappeared.

## [2.5.0] - 2019-09-26

### Added

- Auto pause of playback when a second player begins playing on the same page. Can be disabled by
  `options.interface.addons.singlePlayback = false`

## [2.4.1] - 2019-09-26

### Added

- Clicking the HoverPreview will now play the video

### Changed

- Set bounds on options for HoverPreview and SeekPreview

## [2.4.0] - 2019-09-25

### Added

- A feature to show a preview of a video on hover over
- `options.interface.addons.hoverPreview` Hover Preview option. `default: false`

## [2.3.1] - 2019-09-24

### Fixed

- Backward compatibility break introduced in 2.3.0 for Typescript typed usage of this library

## [2.3.0] - 2019-09-24

### Added

- A feature to allow thumbnail seeking on the progress bar for Stream playback only
- `options.interface.addons.seekPreview` Seek Preview on hover on progress bar for Stream videos
- Higher resolution posters for Stream playbacks

### Changed

- Use new PlaybackResource.links.thumbnail to generate thumbnail image URI

### Removed

- Unused `convertPlaybackToSource` functionality

### Fixed

- Demo URIs for videos on staging-boclips.com

## [2.2.2] - 2019-08-08

### Added

- Set `withCredentials` attribute in Axios to support cookies when talking to the Boclips API.

## [2.2.1] - 2019-08-07

### Fixed

- Remove a bad mutation of the streamUrl in Hls

## [2.2.0] - 2019-08-07

### Added

- `CONTRIBUTING.md` and `demo/README.md`
- Attempted recovery of manifest file loading in HLS

### Fixed

- `options.interface.controls` was previously being appended to the default controls
- Non-fatal HLS errors threw exceptions, preventing automatic recovery
- Render an error when the stream manifest is missing
- TypeError when handling plyr events post destruction

### Changed

- Internal representation of `Wrapper` to a better named `MediaPlayer`
- Internal refactor to separate concerns of Hls & Plyr

## [2.1.6] - 2019-07-29

### Fixed

- Recursive destruction of HLS/Plyr on error destroying HLS/Plyr

## [2.1.5] - 2019-07-23

### Fixed

- Segment start now works on Safari for stream videos

## [2.1.4] - 2019-07-16

### Added

- `options.debug: boolean` for control over debug output

### Removed

- Non-fatal playback Errors

### Security

- Bump `lodash` for https://www.npmjs.com/advisories/1065 - only `package-lock.json`

## [2.1.3] - 2019-07-15

### Security

- Bump `mixin-deep` for https://www.npmjs.com/advisories/1013 - only `package-lock.json`
- Bump `set-value` for https://www.npmjs.com/advisories/1012 - only `package-lock.json`

## [2.1.2] - 2019-07-11

### Fixed

- Non-fatal `fragParseErrors` in HLS cause the player to render the error splash.

## [2.1.1] - 2019-07-09

### Fixed

- Allow the `options.api.tokenFactory` to return null, and not affect the Authorization header.

## [2.1.0] - 2019-07-05

### Added

- Segmented playback for videos, auto starting and pausing at the time specified
  ```typescript
  loadVideo: (videoUri: string, segment: PlaybackSegment) => Promise<void>;
  ```
- User interaction event emitted for internal analytics when:
  - Fullscreen enabled/disabled
  - Speed change
  - Fast forward
  - Mute / Unmute

## [2.0.0] - 2019-06-25

### Added

- Added an option to pass an authenticated bearer token to the API
  ```typescript
  options.api.tokenFactory: () => Promise<string>;
  ```
- Added an option to replace now removed `options.analytics.handleOnPlayback`
  ```typescript
  options.analytics.handleOnSegmentPlayback: (video: Video, startSeconds: number, endSeconds: number) => void;
  ```
- Added destroy function to public Player API
  ```typescript
  destroy: () => void;
  ```

### Changed

- Significant refactor of several internal modules
- _BREAKING:_ [`options.player` renamed to `options.interface`](./UPGRADING.md#optionsplayer-renamed-to-optionsinterface)
- _BREAKING:_ [Internal Axios Instance](./UPGRADING.md#internal-axios-instance) - API calls will use an internal axios instance. Any external interceptors will have no affect on API
  calls made by the player.

### Removed

- _BREAKING:_ [Removed `options.analytics.handleOnPlayback`](./UPGRADING.md#removed-optionsanalyticshandleonplayback) - replaced with `options.analytics.handleOnSegmentPlayback`

### Fixed

- Minor documentation fixes

## [1.0.2] - 2019-06-21

### Deprecated

- `options.analytics.handleOnPlayback` callback signature will be replaced with in the a subsequent release with:
  ```typescript
  options.analytics.handleOnSegmentPlayback: (video: Video, startSeconds: number, endSeconds: number) => void;
  ```

## [1.0.1] - 2019-06-14

### Added

- Support for the rest of the controls supported by Plyr
- Enhanced error handling to display a friendly error message

### Fixed

- Catch exceptions caused when destroying a YouTube Plyr instance after the elements are removed from the DOM.
- BoclipsPlayer state reset before loading a new video
- Plyr control positioning when only using mute, and not volume

## [1.0.0] - 2019-06-05

### Added

- Changelog
- Multiple demo harnesses for verifying features manually
- Concourse pipeline configuration
- Plyr video player enhancement
- Event tracking for segment playback analytics
- Documentation for https://docs.boclips.com
- Closed Captions scale for large screens
- HLS support where possible
- Controls can be customised
- Multiple boclips-players can be instantiated on a single page
- Boclips branding
- Destruction cleans up resources
