# `my-cli`

A compilation of my CLI snippets.

## Get started

1. Install globally: `npm install -g @mist3rbru/my-cli`.
2. Configure your cli for the first time: `my-cli setup`.
3. Use `my <command> <parameters>` to trigger a command, or just `my` to take an overview of all commands.

## Commands

- `setup`: Prepare the required setup
  - example: my setup
- `api`: Create an api with typescript, prettier, eslint and jest with opined configuration
  - params: `<name>`
  - example: my api ts-api
- `branch`: List all local and remote branches, to select and checkout to it
  - alias: `b`
  - example: my b
- `clone`: Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode
  - params: `<repository>`
  - flags: `--root`
  - example: my clone my-cli
- `http`: Make an http request
  - params: `<method?> <url> <body?> <headers?>`
  - example: my http post /user key1=1 key2.subset1=true key2.subset2=3.14 key3=Hello+World h.authorization=token
- `init`: Initialize a default project with git and typescript
  - example: my init
- `open`: Open a project on vscode, the projects available are based on `setup`
  - params: `<project>...`
  - flags: `--workspace` | `-w` | `--reuse-window` | `-r`
  - example: my open my-cli my-app my-api
- `outdated`: Check if package is on latest version
  - example: my outdated
- `password`: Generate a random and safe password with the given length
  - alias: `pass`
  - params: `<length>`
  - example: my pass 30
- `play`: Open a music player on your default browser
  - params: `y` | `yt` | `youtube` | `s` | `spot` | `spotify`
  - example: my play yt
- `pomodoro`: Start a pomodoro timer
  - alias: `pomo`
  - params: `d` | `<work> <rest>`
  - example: my pomo d
- `remove`: Remove recursively a folder or file on the relative given path
  - alias: `rm`
  - params: `<folder | file>...`
  - example: my rm dist coverage
- `run`: Run scripts in sequence
  - params: `<script>...`
  - flags: `--deep` | `-d` | `--partial` | `-p`
  - example: my run lint build "vitest --run"
- `snippet`: Create snippet collections on local project
  - params: `api` | `api-test` | `esm` | `nest` | `typescript`
  - flags: `--create`
  - example: my snippet nest nest-test
- `upgrade`: Update package to latest version
  - alias: `up`
  - example: my up
- `version`: Display current package version
  - example: my version

### Global flags:

- `--silent`: ignores cmd outputs
- `--force`: ignores previous `setup`
- `--help`: displays command details
