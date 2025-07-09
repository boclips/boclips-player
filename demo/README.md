# Demos

Here we have several demos that point to our API to playback videos. These demos will change over time, but should always be functional.

## Running the demo

Each demo is defined in the package.json file as a script that can be executed on its own. Simply choose the demo you wish to run and append the folder name to the command:

```
$ pnpm demo:$FOLDER_NAME # for example demo:module-authorized
```

## `module`

This demo imports the `boclips-player` as a node module.

## `module-authorized`

This demo imports the `boclips-player` as a node module, and takes advantage of the `boclips-js-security` module to authenticate the calls to the API.

## `static`

This is the simplest demo, loading the code statically as an JavaScript asset and initialising the player in a `script` tag.

## `static-several`

A demo that showcases the ability to have multiple players on the same page.

## `unpkg`

A demo that does not use the bundled code, but instead relies on the unpkg.com copy of the `boclips-player`.
