# Contributing

So you're interested in contributing to this project, that's great! 

This project is maintained by a team of engineers at Boclips, and new features are built into the library when the need
arises.

That said, if you're using the `boclips-player` and have found a bug, or would like to implement a new feature, we'll always welcome an issue, or a pull request. 

## Planning your contribution

### Raising bugs, or requesting features

Please feel free to open an issue in Github.

We use Pivotal Tracker internally to manage our backlog – it may be that you request a feature we're already working on, or a bug that we've already got our sights set on. In these cases we'll give you transparency on the status of these requests.

### Contributing Code

If you feel like fixing a bug, or implementing a feature you're more than welcome to open a pull request against `master`.

In the case of substantial features, we ask that you create an issue to discuss the feature first to ensure that it aligns with our longer term plan for this library – we'd hate for you to go to a lot of effort to implement something that may be rejected.

TDD is important to us as a way of ensuring that we're producing high quality standard code, we will ask that you introduce tests for any new features, and cover bug fixes with tests to ensure there are no regressions.

#### Code Style

We use linting to achieve a standard tone across our codebases, we appreciate you adhering to the rules that we've put in place.
Our linting tools are installed as dev dependencies on this project, so once you're happy with the code you've written you can
go ahead and run the linting `pnpm lint`. Most lint failures can be fixed automatically: `pnpm lint:fix`.

## Development

This project is written exclusively in TypeScript. You can find many resources online, but here are a few of our highlights:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/home.html)
- [A crash course in TypeScript](https://www.freecodecamp.org/news/a-crash-course-in-typescript-e6bf9c10946/)

### Setting up local environment

For an internal contributor you should directly clone the `boclips/boclips-player` repo. For an external contributor you'll need to fork our repo and clone your own.

```
$ git clone git@github.com:boclips/boclips-player.git # Or your clone
$ cd ./boclips-player
$ npm install
```

### Running the demos

There are several demos that can be run via `pnpm`. See `./demo/` for a list of the available demos.

For example:
```
$ pnpm demo:static
```

### Making changes

Internally we use trunk-based development, this means that we'll be making changes directly on the master branch without the use of pull requests.

If you are an external contributor we will naturally request that you fork our repo and make any changes against whatever branch you'd like, just
remember to create a pull request against our `master` branch.

Please use the following command to push your changes, this will ensure the tests pass and the various linters are satisfied.
```
$ ./ship
```
