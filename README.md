# `my-cli`

A compilation of my CLI snippets.

## Get started

1. Install globally: `npm install -g @mist3rbru/my-cli`.
2. Configure your cli for the first time: `my-cli setup`.
3. Use `my <command> <parameters>` to trigger a command, or just `my` to take an overview of all commands.

## Commands

- `setup`: Prepare the required setup
  - example: my setup
- `checkout`: List all local and remote branches, to select and checkout to it
  - alias: `b`
  - example: my b
- `clone`: Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode
  - params: `<repository>`
  - flags: `--root` | `--filter` | `-f`
  - example: my clone my-cli
- `http`: Make an http request
  - params: `<method?> <url> <body?> <headers?>`
  - example: my http post /user key1=1 key2.subset1=true key2.subset2=3.14 key3=Hello+World h.authorization=token
- `init`: Initialize a default project with git and typescript
  - example: my init
- `open`: Open a project on vscode, the projects available are based on `setup`
  - params: `<...projects>`
  - flags: `--workspace` | `-w` | `--reuse-window` | `-r` | `--filter` | `-f`
  - example: my open my-cli my-app my-api
- `password`: Generate a random and safe password with the given length
  - alias: `pass`
  - params: `<length>`
  - example: my pass 30
- `run`: Run scripts in sequence
  - params: `<...scripts>`
  - flags: `--deep` | `-d` | `--partial` | `-p`
  - example: my run lint build "vitest --run"
- `script`: Write common scripts on local package.json
  - params: `lint` | `jest` | `vitest` | `prisma` | `changeset`
  - example: my scripts
- `snippet`: Create snippet collections on local project
  - params: `api` | `api-test` | `esm` | `nest` | `react` | `react-native` | `react-test` | `typescript`
  - flags: `--create`
  - example: my snippet nest nest-test
- `upgrade`: Update package to latest version
  - alias: `up`
  - example: my up

