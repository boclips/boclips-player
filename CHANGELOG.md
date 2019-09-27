# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
- *BREAKING:* [`options.player` renamed to `options.interface`](./UPGRADING.md#optionsplayer-renamed-to-optionsinterface)
- *BREAKING:* [Internal Axios Instance](./UPGRADING.md#internal-axios-instance) - API calls will use an internal axios instance. Any external interceptors will have no affect on API
calls made by the player.
  
### Removed
- *BREAKING:* [Removed `options.analytics.handleOnPlayback`](./UPGRADING.md#removed-optionsanalyticshandleonplayback) - replaced with `options.analytics.handleOnSegmentPlayback`

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

