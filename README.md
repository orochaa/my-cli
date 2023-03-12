# `my-cli`

A compilation of my CLI snippets.

## Get started

1. Install globally: `npm install -g @mist3rbru/my-cli`.
2. Configure your cli for the first time: `my-cli setup`.
3. Use `my <command> <parameters>` to trigger a command, or just `my` to take an overview of all commands.

## Commands

- `setup`: prepare the required setup.
  - usage: `my setup`
- `remove`: remove recursively a folder or file on the relative given path.
  - usage: `my remove` | `my remove dist` | `my remove ./dist`
  - aliases:
    - `remove`: rm.
- `store`: save a key=value on a local json file.
  - usage: `my store` | `my store key=value`
- `recover`: return the value of a saved key.
  - usage: `my recover` | `my recover key`
- `password`: generate a random and safe password with the given length.
  - usage: `my password` | `my password 20`
- `init`: initialize a default project with git and typescript.
  - usage: `my init`
- `api`: create an api with typescript, prettier, eslint and jest with opined configuration.
  - usage: `my api` | `my api my-app`
- `open`: open a project on vscode, the projects available are based on `setup`
  - usage: `my open` | `my open my-app other-app`
- `run`: run scripts from project's package.json in sequence.
  - usage: `my run` | `my run lint build test`
- `clone`: clone a Github's repository based on `setup`.
  - usage: `my clone` | `my clone repository`
- `play`: open a music player on your default browser;
  - usage: `my play` | `my play spotify`
  - aliases:
    - `youtube`: y, yt, youtube.
    - `spotify`: s, spot, spotify.
- `pomodoro`: start a pomodoro timer.
  - usage: `my pomodoro` | `my pomodoro 25 5`
