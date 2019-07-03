# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Segmented playback for videos, auto starting and pausing at the time specified
  ```typescript
  loadVideo: (videoUri: string, segment: PlaybackSegment) => Promise<void>;
  ```
- User interaction event emitted for internal analytics when:
  - Fullscreen enabled/disabled
  - Captions enabled/disabled/changed
  
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

