import { App } from '@/main/app.js'
import { execAsync } from '@/utils/cmd.js'
import { cwd } from '@/utils/constants.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spinner } from '@clack/prompts'

const tsconfig = `{
  compilerOptions: {
    /* Build */
    target: 'ESNext',
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    noEmit: true,
    lib: ['es2022'],

    /* Base Options: */
    esModuleInterop: true,
    skipLibCheck: true,
    isolatedModules: true,
    moduleDetection: 'force',

    /* Strictness */
    strict: true,
    verbatimModuleSyntax: true,
    forceConsistentCasingInFileNames: true,
    useUnknownInCatchVariables: false,

    /* Alias */
    baseUrl: '.',
    paths: {
      '@/tests/*': ['__tests__/*'],
      '@/*': ['src/*'],
    },
  },
}`

const prettier = `{
  "endOfLine": "lf",
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 80,
  "trailingComma": "es5",
  "plugins": [],
}`

async function initCommand() {
  const s = spinner()
  s.start('Preparing setup')

  await execAsync('pnpm init')
  await execAsync('pnpm add -D typescript @types/node tsx prettier')
  await execAsync('git init')
  await execAsync('git checkout -b master')
  await writeFile(join(cwd, '.gitignore'), 'node_modules/\ndist/\n\n.env')
  await writeFile(join(cwd, '.gitattributes'), '* text=auto eol=lf')
  await writeFile(join(cwd, 'tsconfig.json'), tsconfig)
  await writeFile(join(cwd, '.prettierrc.json'), prettier)
  await writeFile(join(cwd, '.prettierignore'), 'node_modules/\n\n*.yaml')
  await mkdir(join(cwd, 'src'))
  await writeFile(join(cwd, 'src/index.ts'), '')

  s.stop('All set')
}

export function initRecord(app: App): void {
  app.register({
    name: 'init',
    alias: null,
    params: null,
    description: 'Initialize a default project with git and typescript',
    example: 'my init',
    action: initCommand,
  })
}
