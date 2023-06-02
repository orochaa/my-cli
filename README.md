# `my-cli`

A compilation of my CLI snippets.

## Get started

1. Install globally: `npm install -g @mist3rbru/my-cli`.
2. Configure your cli for the first time: `my-cli setup`.
3. Use `my <command> <parameters>` to trigger a command, or just `my` to take an overview of all commands.

## Commands

- `setup`: Prepare the required setup
  - example: my setup
- `remove`: Remove recursively a folder or file on the relative given path
  - alias: `rm`
  - params: `<folder | file>...`
  - example: my rm dist coverage
- `store`: Save a key1=value on a local json file
  - params: `<key>=<value>`
  - example: my store key1=foo key2.subset1=bar
- `recover`: Return the value of a saved key
  - params: `<key>...`
  - example: my recover git projects
- `password`: Generate a random and safe password with the given length
  - alias: `pass`
  - params: `<length>`
  - example: my pass 30
- `init`: Initialize a default project with git and typescript
  - example: my init
- `api`: Create an api with typescript, prettier, eslint and jest with opined configuration
  - params: `<name>`
  - example: my api ts-api
- `open`: Open a project on vscode, the projects available are based on `setup`
  - params: `<project>...`
  - example: my open my-cli my-app my-api
- `run`: Run scripts from project's package.json in sequence
  - params: `<script>...`
  - flags: `--deep` | `-D`
  - example: my run lint build test
- `clone`: Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode
  - params: `<repository>`
  - example: my clone my-cli
- `play`: Open a music player on your default browser
  - params: `yt` | `spotify`
  - example: my play yt
- `pomodoro`: Start a pomodoro timer
  - alias: `pomo`
  - params: `d` | `<work> <rest>`
  - example: my pomo d
- `outdated`: Check if package is on latest version
  - example: my outdated
- `upgrade`: Update package to latest version
  - alias: `up`
  - example: my up
- `branch`: List all local and remote branches, to select and checkout to it
  - alias: `b`
  - example: my b
- `http`: Make an http request
  - params: `<method?> <url> <body?> <headers?>`
  - example: my http post /user key1=1 key2.subset1=true key2.subset2=3.14 key3=Hello+World h.authorization=token
