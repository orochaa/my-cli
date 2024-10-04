
<a name="v0.2.22"></a>
## [v0.2.22](https://github.com/Mist3rBru/my-cli/compare/v0.3.11...v0.2.22) (2024-10-04)

### 🚀 Features

* **rename:** add rename command

### 🛠️ Refactors

* exit status code 1 on os.Getwd() error

### 🏡 Chore

* update changelog


<a name="v0.3.11"></a>
## [v0.3.11](https://github.com/Mist3rBru/my-cli/compare/v0.3.10...v0.3.11) (2024-08-23)

### 🩹 Fixes

* prompt navigation on filter


<a name="v0.3.10"></a>
## [v0.3.10](https://github.com/Mist3rBru/my-cli/compare/v0.3.9...v0.3.10) (2024-08-12)

### 🚀 Features

* **checkout:** accept arbitrary checkout
* **copy:** add task queue
* **copy:** add task queue

### 🛠️ Refactors

* use native go-clack's error handling
* **lockfile:** simplify user name validation
* **snippet:** update snippets


<a name="v0.3.9"></a>
## [v0.3.9](https://github.com/Mist3rBru/my-cli/compare/v0.2.21...v0.3.9) (2024-08-06)

### 🚀 Features

* **checkout:** accept arbitrary checkout


<a name="v0.2.21"></a>
## [v0.2.21](https://github.com/Mist3rBru/my-cli/compare/v0.3.8...v0.2.21) (2024-08-01)


<a name="v0.3.8"></a>
## [v0.3.8](https://github.com/Mist3rBru/my-cli/compare/v0.3.7...v0.3.8) (2024-08-01)

### 🚀 Features

* add filter to selection prompts


<a name="v0.3.7"></a>
## [v0.3.7](https://github.com/Mist3rBru/my-cli/compare/v0.3.6...v0.3.7) (2024-07-11)

### 🚀 Features

* **clone:** add named target folder

### 🩹 Fixes

* **clone:** github repo url regex

### 🏡 Chore

* update changelog


<a name="v0.3.6"></a>
## [v0.3.6](https://github.com/Mist3rBru/my-cli/compare/v0.3.5...v0.3.6) (2024-07-04)

### 🚀 Features

* **my-cli:** add custom root command

### 🏡 Chore

* update changelog


<a name="v0.3.5"></a>
## [v0.3.5](https://github.com/Mist3rBru/my-cli/compare/v0.3.4...v0.3.5) (2024-07-03)

### 🚀 Features

* **run:** add go project support

### 🩹 Fixes

* **copy:** relative path mapping

### 🛠️ Refactors

* make prompts required

### 🏡 Chore

* update changelog
* upgrade dapendencies
* update changelog


<a name="v0.3.4"></a>
## [v0.3.4](https://github.com/Mist3rBru/my-cli/compare/v0.3.3...v0.3.4) (2024-07-02)

### 🚀 Features

* **clone:** add spinner to fetching repos step

### 🩹 Fixes

* **upgrade:** loading spinner

### 🛠️ Refactors

* **utils:** remake lockfile logic

### 🏡 Chore

* remove old unused script
* update changelog


<a name="v0.3.3"></a>
## [v0.3.3](https://github.com/Mist3rBru/my-cli/compare/v0.3.2...v0.3.3) (2024-07-01)

### 🚀 Features

* add http command

### 🩹 Fixes

* **setup:** use user.login instead of user.name


<a name="v0.3.2"></a>
## [v0.3.2](https://github.com/Mist3rBru/my-cli/compare/v0.3.1...v0.3.2) (2024-06-26)

### 🩹 Fixes

* **setup:** use user.login instead of user.name

### 🏡 Chore

* remake changelog
* add changelog


<a name="v0.3.1"></a>
## [v0.3.1](https://github.com/Mist3rBru/my-cli/compare/v0.3.0...v0.3.1) (2024-06-26)

### 🚀 Features

* add setup command

### 🏡 Chore

* remake changelog
* add changelog
* update readme


<a name="v0.3.0"></a>
## [v0.3.0](https://github.com/Mist3rBru/my-cli/compare/v0.2.20...v0.3.0) (2024-06-24)

### 🚀 Features

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

### 🧪 Tests

* **clone:** improve test metodology
* **clone:** add gh cli tests

### 🛠️ Refactors

* migrate to go lang
* rename branch command to checkout
* corretly handle json files
* module utils
* **clone:** improve code readability and performance

### 🏡 Chore

* update readme
* update dependencies
* bump dependencies
* bump dependencies
* add clone path changeset ([#53](https://github.com/Mist3rBru/my-cli/issues/53))
* add clone path changeset


<a name="v0.2.20"></a>
## [v0.2.20](https://github.com/Mist3rBru/my-cli/compare/v0.2.18...v0.2.20) (2024-02-26)

### 🚀 Features

* add scripts command
* **clone:** add --filter flag
* **http:** add styled http response
* **init:** add initial scripts to package.json

### 🩹 Fixes

* **ci:** add process.stdout optional chain ([#51](https://github.com/Mist3rBru/my-cli/issues/51))
* **ci:** add process.stdout optional chain
* **clone:** use global constant maxItems
* **init:** add project path to .eslintrc.json
* **init:** disabled tsconfig.noEmit option
* **open:** invalid filter param validation
* **snippets:** rename model typo to entity

### 🧪 Tests

* **scripts:** add tests

### 🛠️ Refactors

* lint code
* rename getPackgeJson to readPackageJson and add writePackageJson
* lint with eslint-plugin-mist3rbru

### 🏡 Chore

* bump dependencies
* bump dependencies


<a name="v0.2.18"></a>
## [v0.2.18](https://github.com/Mist3rBru/my-cli/compare/v0.2.17...v0.2.18) (2023-12-19)

### 🚀 Features

* **init:** add editorconfig and eslint
* **init:** init project by param
* **run:** install dependencies with right package manager

### 🩹 Fixes

* **clone:** max item list
* **init:** test suite

### 🛠️ Refactors

* lint with eslint-plugin-mist3rbru
* eslint fix
* **global:** clean code
* **tests:** mock instead of manipulate lockfile

### 🏡 Chore

* add eslint
* bump dependencies


<a name="v0.2.17"></a>
## [v0.2.17](https://github.com/Mist3rBru/my-cli/compare/v0.2.16...v0.2.17) (2023-11-24)

### 🩹 Fixes

* **init:** test suite


<a name="v0.2.16"></a>
## [v0.2.16](https://github.com/Mist3rBru/my-cli/compare/v0.2.15...v0.2.16) (2023-11-24)

### 🚀 Features

* **global:** add relative max items to selects

### 🩹 Fixes

* **init:** test suite
* **init:** remove git checkout
* **open:** auto open on filter a single project


<a name="v0.2.15"></a>
## [v0.2.15](https://github.com/Mist3rBru/my-cli/compare/v0.2.12...v0.2.15) (2023-11-23)

### 🚀 Features

* snippet command
* **branch:** pull local branch from origin
* **clone:** --root flag
* **init:** add opinated config
* **open:** --filter flag
* **snippet:** react-antive snippets
* **snippet:** react snippets

### 🩹 Fixes

* ci
* ci
* **global:** bundle package with public folder
* **global:** bundle package with public folder

### 🧪 Tests

* snippet command

### 📖 Documentation

* update readme with latest changes

### 🏡 Chore

* update tsconfig with modern patterns
* always add trailing comma
* change module resolution
* **global:** add type imports

### Reverts

* fix: ci


<a name="v0.2.12"></a>
## [v0.2.12](https://github.com/Mist3rBru/my-cli/compare/v0.2.11...v0.2.12) (2023-10-18)

### 🚀 Features

* --help flag
* **clone:** accept http repository
* **clone:** install deps with right package manager

### 🩹 Fixes

* **global:** store setup config on home dir
* **http:** convert body to JSON object

### 🛠️ Refactors

* move setup-lock.json to os temp folder


<a name="v0.2.11"></a>
## [v0.2.11](https://github.com/Mist3rBru/my-cli/compare/v0.2.10...v0.2.11) (2023-10-16)


<a name="v0.2.10"></a>
## [v0.2.10](https://github.com/Mist3rBru/my-cli/compare/v0.2.9...v0.2.10) (2023-10-06)

### 🚀 Features

* **init:** add prettier base setup
* **run:** print run command on prompt
* **run:** script hint

### 🩹 Fixes

* restore cursor on pomodoro exit

### 🏡 Chore

* add [@clack](https://github.com/clack)/core
* increse max prompt options
* bump dependencies and migrate to esnext


<a name="v0.2.9"></a>
## [v0.2.9](https://github.com/Mist3rBru/my-cli/compare/v0.2.6...v0.2.9) (2023-08-16)

### 🚀 Features

* **run:** custom scripts
* **run:** custom scripts

### 🩹 Fixes

* **play:** change open import to dynamic import
* **run:** print 'npx' command


<a name="v0.2.6"></a>
## [v0.2.6](https://github.com/Mist3rBru/my-cli/compare/v0.2.4...v0.2.6) (2023-07-06)

### 🚀 Features

* **global:** feedback message from prompt cancellation
* **open:** conditional workspace prompt
* **setup:** accept undefined project root
* **setup:** improve commom mistake validations
* **version:** version command

### 🩹 Fixes

* **play:** support multi platforms

### 🧪 Tests

* remake sut manipulation
* **global:** enable multi thread
* **version:** add version commands tests

### 🛠️ Refactors

* remove temp folder
* clean code
* **upgrade:** ignore npm logs
* **upgrade:** separate outdated from upgrade

### 🏡 Chore

* update dependencies
* clean code
* remove msg linter


<a name="v0.2.4"></a>
## [v0.2.4](https://github.com/Mist3rBru/my-cli/compare/v0.2.3...v0.2.4) (2023-06-20)

### 🩹 Fixes

* **open:** ignore config folders

### 🏡 Chore

* **global:** remove and  commands because it does not last on update


<a name="v0.2.3"></a>
## [v0.2.3](https://github.com/Mist3rBru/my-cli/compare/v0.2.2...v0.2.3) (2023-06-15)

### 🚀 Features

* **open:** reuse window on -r flag

### Style

* lint

### 🩹 Fixes

* **clone:** prevent install dependencies of non node project
* **open:** prevent prompt to display root paths
* **run:** -d flag not catching up

### 📖 Documentation

* reorder commands


<a name="v0.2.2"></a>
## [v0.2.2](https://github.com/Mist3rBru/my-cli/compare/v0.2.1...v0.2.2) (2023-06-09)

### 🚀 Features

* support concatenated paths on open command params
* **cmd:** add hasFlag() utility function
* **global:** --silent and --force flags
* **global:** log cmd commands
* **open:** add workspace support

### 🩹 Fixes

* **docs:** map all play params
* **http:** uncaught missing params error

### 🧪 Tests

* **open:** fix tests fo linux environment

### 🛠️ Refactors

* **mappers:** improve mergeObjects efficiency

### 📖 Documentation

* update readme with latest changes

### 🏡 Chore

* lint files
* **actions:** add docs to ci


<a name="v0.2.1"></a>
## [v0.2.1](https://github.com/Mist3rBru/my-cli/compare/v0.2.0...v0.2.1) (2023-06-02)

### 🚀 Features

* commands documentation script
* commands documentation script

### 🧪 Tests

* convertToJSON function
* add missing tests

### 🛠️ Refactors

* remove unnecessary async from docs script
* improve code semantic
* add global error handler
* add convertToJson to store command

### 🏡 Chore

* complete clone's command description
* complete clone's command description
* remove index.mjs on build


<a name="v0.2.0"></a>
## [v0.2.0](https://github.com/Mist3rBru/my-cli/compare/v0.1.3...v0.2.0) (2023-05-19)

### 🚀 Features

* http command
* deep run command
* add silent mode

### 🩹 Fixes

* ci

### 🧪 Tests

* duplicate commands
* add app tests
* fix command tests
* branch command

### 🛠️ Refactors

* add centralized app instance
* add command examples
* add app instance

### 🏡 Chore

* change tsup to unbuild


<a name="v0.1.3"></a>
## [v0.1.3](https://github.com/Mist3rBru/my-cli/compare/v0.1.2...v0.1.3) (2023-05-02)

### 🚀 Features

* branch command
* branch command
* upgrade commands
* pass alias
* **setup:** add git validation
* **upgrade:** spinner loading

### 🩹 Fixes

* ci
* pomodoro strobbing

### 🏡 Chore

* update readme
* rework patch release
* bumb ci version
* bump ci version
* update dependencies

### Reverts

* Version Packages


<a name="v0.1.2"></a>
## [v0.1.2](https://github.com/Mist3rBru/my-cli/compare/v0.1.0...v0.1.2) (2023-03-20)

### 🚀 Features

* add setup command validation for path values

### 🩹 Fixes

* npm ignore

### 🏡 Chore

* add select prompt to remove command


<a name="v0.1.0"></a>
## v0.1.0 (2023-03-14)

### 🚀 Features

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

### Style

* add import sorting

### 🩹 Fixes

* ci pipeline
* utc time location
* double setup execution
* relative path conflict

### 🧪 Tests

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

### 🛠️ Refactors

* add test helpers
* handle duplication error on clone command
* make prompt messages user friendlier
* add current locale time to pomodoro display
* add dynamic switch command
* ensure lockfile has setup keys
* move types.ts to dedicated files
* improve user experience
* improve not found error handling

### 📖 Documentation

* add readme

### 🏡 Chore

* rename minor changes
* add pomodoro alias
* remove command options type
* add command options type check

