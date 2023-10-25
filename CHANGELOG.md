# @mist3rbru/my-cli

## 0.2.12

### Patch Changes

- 6634cf5: feat(clone): install deps with right package manager
- 3ec63a3: feat(clone): accept http repository
- 3258de4: feat: --help flag
- 06ec1b5: refactor: move setup-lock.json to os temp folder
- 2668524: fix(global): store setup config on home dir
- 4435440: fix(http): convert body to JSON object

## 0.2.11

### Patch Changes

- 119e565: feat(clone): install deps with right package manager
- 119e565: feat(clone): accept http repository
- 119e565: feat: --help flag
- 119e565: refactor: move setup-lock.json to os temp folder

## 0.2.10

### Patch Changes

- 54bd370: feat(run): print run command on prompt
- be5c32f: fix: restore cursor on pomodoro exit

## 0.2.9

### Patch Changes

- f36a5ba: feat(branch,clone): scroll on select prompt
- 3c67e13: fix(run): print 'npx' command

## 0.2.8

### Patch Changes

- 828f9d5: feat(run): custom scripts

## 0.2.7

### Patch Changes

- 3004b7b: fix(play): change open import to dynamic import

## 0.2.6

### Patch Changes

- e360417: fix(play): support multi platforms
- 6c3c756: feat(global): feedback message from prompt cancellation

## 0.2.5

### Patch Changes

- a497a11: feat(version): version command
- f138931: feat(open): conditional workspace prompt
- 67f293d: feat(setup): improve common mistake validations

## 0.2.4

### Patch Changes

- a2ab47b: fix(open): ignore config folders
- 6e9f812: chore(global): remove `store`and `recover` commands because it does not last on update

## 0.2.3

### Patch Changes

- dfc7e3a: fix(open): prevent prompt to display root paths
- 0b184c9: fix(clone): prevent install dependencies of non node project
- 48e0f98: fix(run): -d flag not catching up
- c5dfa59: feat(open): reuse window on -r flag

## 0.2.2

### Patch Changes

- 13f08e9: feat(open): add workspace support
- d59fa50: feat(open): support concatenated paths
- f9c75df: fix(http): uncaught missing params error
- 6af72d3: feat(cmd): add hasFlag() utility function
- 7da999f: feat(global): log cmd commands
- 8355b6e: feat(global): --silent and --force flags
- e284d01: refactor(mappers): improve mergeObjects() performance
- b1e910f: fix(docs): map all `play` params

## 0.2.1

### Patch Changes

- b164c3c: feat: commands documentation script

## 0.2.0

### Minor Changes

- 79f9e2f: refactor: add centralized app instance

### Patch Changes

- 68a1d15: feat: deep run command
- 2e7015d: feat: http command

## 0.1.3

### Patch Changes

- 7925b38: feat: branch command
- 3e2b093: feat: upgrade commands
- 3e2b093: fix: `pomodoro` strobbing

## 0.1.2

### Patch Changes

- 1eae37b: feat: add setup command validation for path values
- 73497f6: chore: add select prompt to remove command

## 0.1.1

### Patch Changes

- 0e373fc: fix: npm ignore files

## 0.1.0

### Minor Changes

- ab04f84: feat: run command
- 8833c36: feat: remove command
- f49df9c: feat: create ts api command
- 8833c36: feat: store command
- 890fc83: feat: pomodoro command
- fc157af: feat: play command
- 457c82c: feat: recover command
- 1d1cf82: feat: init command
- 6d6d7c8: feat: open project command
- 1a6cf68: feat: password generator command
- ee2b7bc: feat: setup command
