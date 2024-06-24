# `my-cli`

A compilation of my CLI snippets.

## Get started

1. Install globally: `go install github.com/Mist3rBru/my-cli@latest`.
2. Configure your cli for the first time: `my-cli setup`.
3. Use `my-cli <command> <parameters>` to trigger a command, or just `my-cli` to take an overview of all commands.

## Commands

- `setup`: Prepare the required setup
- `checkout`: List all local and remote branches, to select and checkout to it
- `clone`: Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode
- `http`: Make an http request
- `init`: Initialize a default project with git and typescript
- `open`: Open a project on vscode, the projects available are based on `setup`
- `password`: Generate a random and safe password with the given length
- `run`: Run scripts in sequence
- `script`: Write common scripts on local package.json
- `snippet`: Create snippet collections on local project
- `upgrade`: Update package to latest version
