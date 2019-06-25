# Upgrading
All notable manual upgrade steps are listed in this file.

## [Unreleased]

## [2.0.0] - 2019-06-25

### `options.player` renamed to `options.interface`

In order to tidy the API the `player` option has been renamed to `interface`, this should give
a slightly clearer understanding of what the options within pertain to.

If you are using the `player` options, simply rename the key to `interface`. There are no other
changes on this option set.

### Internal Axios Instance

In order to support authentication within the Player, and to prevent any third party axios 
interceptors from interfering with the API calls an internal axios instance is now being used.

If you were relying on an interceptor in your application leaking into the Player axios
instance this will now no longer function.

In order to pass an authentication token to the player, please use
[`options.api.tokenFactory`](https://docs.boclips.com/docs/player-guide.html#_boclips_api_options)

### Removed `options.analytics.handleOnPlayback`

In order to simplify some code paths, and prevent leakage of internal properties that may change
in the near future the `options.analytics.handleOnPlayback` has been removed.

It has been replaced with `options.analytics.handleOnSegmentPlayback` which is executed under the 
same conditions as the previous callback, however it is called with different parameters.

A callback will now be called with `(video: Video, startSeconds: number, endSeconds: number)` if
configured.