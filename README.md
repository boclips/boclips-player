# Boclips Player

![concourse](https://concourse.devboclips.net/api/v1/teams/main/pipelines/boclips-player/jobs/build/badge) [![npm version](https://badge.fury.io/js/boclips-player.svg)](https://www.npmjs.com/package/boclips-player)

BoPlayer is a framework agnostic video player which serves to play Boclips supplied videos on all our supported devices. It will feature core functionality that is expected of modern video players, such as analytics, closed captions, and adaptive bit rate streaming.

It will be integrated into other apps used by our API partners. We want to provide these partners with a complete player solution that allows us to gain insights to how our consumers watch our videos.

## Usage

In order to render the Boclips Player on your page you should load the Javascript and CSS assets in the `head` section.

Boclips Player is hosted in the unpkg.com CDN

In order to load a video you must have a Video URI pointing to our API.

```html
<html>
<head>
    <title>Plain Demo</title>
    <script src="https://unpkg.com/boclips-player/dist/boclips-player.js" type="text/javascript"></script>
    <link rel="stylesheet" href="https://unpkg.com/boclips-player/dist/boclips-player.css" type="text/css"/>
</head>
<body>
<div id="container"></div>
<script type="text/javascript">
    const container = document.querySelector('#container');
    const player = BoclipsPlayer.get(container);
    player.loadVideo('https://path.to.our/video/endpoint');
</script>
</body>
</html>
```

### JavaScript API

#### In the Browser

When this library is loaded via a script tag on a web page it places a factory method on the window.

```typescript
interface BoclipsPlayerFactory {
    get: (container: HTMLElement, options: BoclipsPlayerOptions) => BoclipsPlayer;   
}

interface BoclipsPlayerOptions {
    // There are currently no supported options.
}

interface BoclipsPlayer {
    play: () => Promise<void>;
    pause: () => void;
}
```



## Development

This project is written exclusively in TypeScript. TDD is an absolute must for this business critical library.

### Running the demo

_TBC_

### Developing locally

```
git clone git@github.com:boclips/boclips-player.git
```
```
npm install
```
```
npm run test
```
```
npm run build
```

## Contributing

_TBC_

## License

_TBC_