
<a name="v0.3.1"></a>
## [v0.3.1](https://github.com/Mist3rBru/go-clack/compare/v0.3.0...v0.3.1) (2024-06-26)

### Features

* add setup command

### Chore

* remake changelog
* add changelog
* update readme


<a name="v0.3.0"></a>
## [v0.3.0](https://github.com/Mist3rBru/go-clack/compare/v0.2.20...v0.3.0) (2024-06-24)

### Features

* add password command
* add copy command
* add open command
* add init command
* add upgrade command
* add snippet command
* add shallow run command
* add deep run command
* add support for request config info on demand
* add missing args usecases
* add script command
* add ExecOrExit helper function
* add branch command
* add clone command
* add go setup
* **checkout:** add missing args usecases
* **clone:** add gh cli integration
* **clone:** add support to go project

### Test

* **clone:** improve test metodology
* **clone:** add gh cli tests

### Refactor

* migrate to go lang
* rename branch command to checkout
* corretly handle json files
* module utils
* **clone:** improve code readability and performance

### Chore

* update readme
* update dependencies
* bump dependencies
* bump dependencies
* add clone path changeset ([#53](https://github.com/Mist3rBru/go-clack/issues/53))
* add clone path changeset


<a name="v0.2.20"></a>
## [v0.2.20](https://github.com/Mist3rBru/go-clack/compare/v0.2.18...v0.2.20) (2024-02-26)

### Features

* add scripts command
* **clone:** add --filter flag
* **http:** add styled http response
* **init:** add initial scripts to package.json

### Bug Fixes

* **ci:** add process.stdout optional chain ([#51](https://github.com/Mist3rBru/go-clack/issues/51))
* **ci:** add process.stdout optional chain
* **clone:** use global constant maxItems
* **init:** add project path to .eslintrc.json
* **init:** disabled tsconfig.noEmit option
* **open:** invalid filter param validation
* **snippets:** rename model typo to entity

### Test

* **scripts:** add tests

### Refactor

* lint code
* rename getPackgeJson to readPackageJson and add writePackageJson
* lint with eslint-plugin-mist3rbru

### Chore

* bump dependencies
* bump dependencies


<a name="v0.2.18"></a>
## [v0.2.18](https://github.com/Mist3rBru/go-clack/compare/v0.2.17...v0.2.18) (2023-12-19)

### Features

* **init:** add editorconfig and eslint
* **init:** init project by param
* **run:** install dependencies with right package manager

### Bug Fixes

* **clone:** max item list
* **init:** test suite

### Refactor

* lint with eslint-plugin-mist3rbru
* eslint fix
* **global:** clean code
* **tests:** mock instead of manipulate lockfile

### Chore

* add eslint
* bump dependencies


<a name="v0.2.17"></a>
## [v0.2.17](https://github.com/Mist3rBru/go-clack/compare/v0.2.16...v0.2.17) (2023-11-24)

### Bug Fixes

* **init:** test suite


<a name="v0.2.16"></a>
## [v0.2.16](https://github.com/Mist3rBru/go-clack/compare/v0.2.15...v0.2.16) (2023-11-24)

### Features

* **global:** add relative max items to selects

### Bug Fixes

* **init:** test suite
* **init:** remove git checkout
* **open:** auto open on filter a single project


<a name="v0.2.15"></a>
## [v0.2.15](https://github.com/Mist3rBru/go-clack/compare/v0.2.12...v0.2.15) (2023-11-23)

### Features

* snippet command
* **branch:** pull local branch from origin
* **clone:** --root flag
* **init:** add opinated config
* **open:** --filter flag
* **snippet:** react-antive snippets
* **snippet:** react snippets

### Docs

* update readme with latest changes

### Bug Fixes

* ci
* ci
* **global:** bundle package with public folder
* **global:** bundle package with public folder

### Test

* snippet command

### Chore

* update tsconfig with modern patterns
* always add trailing comma
* change module resolution
* **global:** add type imports

### Reverts

* fix: ci


<a name="v0.2.12"></a>
## [v0.2.12](https://github.com/Mist3rBru/go-clack/compare/v0.2.11...v0.2.12) (2023-10-18)

### Features

* --help flag
* **clone:** accept http repository
* **clone:** install deps with right package manager

### Bug Fixes

* **global:** store setup config on home dir
* **http:** convert body to JSON object

### Refactor

* move setup-lock.json to os temp folder


<a name="v0.2.11"></a>
## [v0.2.11](https://github.com/Mist3rBru/go-clack/compare/v0.2.10...v0.2.11) (2023-10-16)


<a name="v0.2.10"></a>
## [v0.2.10](https://github.com/Mist3rBru/go-clack/compare/v0.2.9...v0.2.10) (2023-10-06)

### Features

* **init:** add prettier base setup
* **run:** print run command on prompt
* **run:** script hint

### Bug Fixes

* restore cursor on pomodoro exit

### Chore

* add [@clack](https://github.com/clack)/core
* increse max prompt options
* bump dependencies and migrate to esnext


<a name="v0.2.9"></a>
## [v0.2.9](https://github.com/Mist3rBru/go-clack/compare/v0.2.6...v0.2.9) (2023-08-16)

### Features

* **run:** custom scripts
* **run:** custom scripts

### Bug Fixes

* **play:** change open import to dynamic import
* **run:** print 'npx' command


<a name="v0.2.6"></a>
## [v0.2.6](https://github.com/Mist3rBru/go-clack/compare/v0.2.4...v0.2.6) (2023-07-06)

### Features

* **global:** feedback message from prompt cancellation
* **open:** conditional workspace prompt
* **setup:** accept undefined project root
* **setup:** improve commom mistake validations
* **version:** version command

### Bug Fixes

* **play:** support multi platforms

### Test

* remake sut manipulation
* **global:** enable multi thread
* **version:** add version commands tests

### Refactor

* remove temp folder
* clean code
* **upgrade:** ignore npm logs
* **upgrade:** separate outdated from upgrade

### Chore

* update dependencies
* clean code
* remove msg linter


<a name="v0.2.4"></a>
## [v0.2.4](https://github.com/Mist3rBru/go-clack/compare/v0.2.3...v0.2.4) (2023-06-20)

### Bug Fixes

* **open:** ignore config folders

### Chore

* **global:** remove and  commands because it does not last on update


<a name="v0.2.3"></a>
## [v0.2.3](https://github.com/Mist3rBru/go-clack/compare/v0.2.2...v0.2.3) (2023-06-15)

### Features

* **open:** reuse window on -r flag

### Style

* lint

### Docs

* reorder commands

### Bug Fixes

* **clone:** prevent install dependencies of non node project
* **open:** prevent prompt to display root paths
* **run:** -d flag not catching up


<a name="v0.2.2"></a>
## [v0.2.2](https://github.com/Mist3rBru/go-clack/compare/v0.2.1...v0.2.2) (2023-06-09)

### Docs

* update readme with latest changes

### Features

* support concatenated paths on open command params
* **cmd:** add hasFlag() utility function
* **global:** --silent and --force flags
* **global:** log cmd commands
* **open:** add workspace support

### Bug Fixes

* **docs:** map all play params
* **http:** uncaught missing params error

### Test

* **open:** fix tests fo linux environment

### Refactor

* **mappers:** improve mergeObjects efficiency

### Chore

* lint files
* **actions:** add docs to ci


<a name="v0.2.1"></a>
## [v0.2.1](https://github.com/Mist3rBru/go-clack/compare/v0.2.0...v0.2.1) (2023-06-02)

### Features

* commands documentation script
* commands documentation script

### Test

* convertToJSON function
* add missing tests

### Refactor

* remove unnecessary async from docs script
* improve code semantic
* add global error handler
* add convertToJson to store command

### Chore

* complete clone's command description
* complete clone's command description
* remove index.mjs on build


<a name="v0.2.0"></a>
## [v0.2.0](https://github.com/Mist3rBru/go-clack/compare/v0.1.3...v0.2.0) (2023-05-19)

### Features

* http command
* deep run command
* add silent mode

### Bug Fixes

* ci

### Test

* duplicate commands
* add app tests
* fix command tests
* branch command

### Refactor

* add centralized app instance
* add command examples
* add app instance

### Chore

* change tsup to unbuild


<a name="v0.1.3"></a>
## [v0.1.3](https://github.com/Mist3rBru/go-clack/compare/v0.1.2...v0.1.3) (2023-05-02)

### Features

* branch command
* branch command
* upgrade commands
* pass alias
* **setup:** add git validation
* **upgrade:** spinner loading

### Bug Fixes

* ci
* pomodoro strobbing

### Chore

* update readme
* rework patch release
* bumb ci version
* bump ci version
* update dependencies

### Reverts

* Version Packages


<a name="v0.1.2"></a>
## [v0.1.2](https://github.com/Mist3rBru/go-clack/compare/v0.1.0...v0.1.2) (2023-03-20)

### Features

* add setup command validation for path values

### Bug Fixes

* npm ignore

### Chore

* add select prompt to remove command


<a name="v0.1.0"></a>
## v0.1.0 (2023-03-14)

### Features

* add auto install deps to clone command
* clone integration with github
* handle multi parameters on open command
* pomodoro command
* play command
* setup command
* git clone command
* run command
* open project command
* add create ts api command
* init command
* password generator command
* recover command
* add store command
* add remove command

### Docs

* add readme

### Style

* add import sorting

### Bug Fixes

* ci pipeline
* utc time location
* double setup execution
* relative path conflict

### Test

* file system utils
* mapper utils
* prompt utils
* run command
* remove command
* store command
* recover command
* play command
* password command
* open command
* init command
* api command
* clone command
* setup command

### Refactor

* add test helpers
* handle duplication error on clone command
* make prompt messages user friendlier
* add current locale time to pomodoro display
* add dynamic switch command
* ensure lockfile has setup keys
* move types.ts to dedicated files
* improve user experience
* improve not found error handling

### Chore

* rename minor changes
* add pomodoro alias
* remove command options type
* add command options type check

