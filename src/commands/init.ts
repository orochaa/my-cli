/* eslint-disable no-secrets/no-secrets */
import type { App } from '@/main/app.js'
import { execAsync } from '@/utils/cmd.js'
import { packageJsonPath } from '@/utils/constants.js'
import { readPackageJson } from '@/utils/file-system.js'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import * as p from '@clack/prompts'

const tsconfig = `{
  "compilerOptions": {
    /* Build */
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": false,
    
    /* Base Options: */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "lib": ["es2022"],

    /* Strictness */
    "strict": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "useUnknownInCatchVariables": false,

    /* Alias */
    "baseUrl": ".",
    "paths": {
      "#tests/*": ["__tests__/*"],
      "#*": ["src/*"]
    }
  }
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
  "plugins": []
}`

const editorconfig = `root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
max_line_length = 80
`

const eslint = `{
  "root": true,
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "extends": ["plugin:mist3rbru/node"],
  "rules": {},
  "overrides": [
    {
      "files": ["__tests__/**/*.spec.ts"],
      "extends": ["plugin:mist3rbru/jest"],
      "rules": {}
    }
  ]
}
`

async function initCommand(params: string[]): Promise<void> {
  const cwd =
    params.length > 0 ? path.join(process.cwd(), params[0]) : process.cwd()

  if (!existsSync(cwd)) {
    await mkdir(cwd)
    process.chdir(cwd)
  }

  const s = p.spinner()

  s.start('Preparing setup')

  await execAsync('pnpm init')
  await execAsync(
    'pnpm add -D typescript @types/node tsx prettier eslint eslint-plugin-mist3rbru npm-run-all2',
  )

  const packageJson = readPackageJson(packageJsonPath)

  if (packageJson?.scripts) {
    packageJson.type = 'module'
    packageJson.scripts.dev = 'tsx src/index.ts'
    packageJson.scripts.build = 'tsc'
    packageJson.scripts.lint = 'run-s lint:tsc lint:prettier lint:eslint'
    packageJson.scripts['lint:tsc'] = 'tsc --noEmit'
    packageJson.scripts['lint:prettier'] = 'prettier --write .'
    packageJson.scripts['lint:eslint'] =
      'eslint --fix "src/**/*.ts" "__tests__/**/*.ts"'
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  await execAsync('git init')
  await writeFile(
    path.join(cwd, '.gitignore'),
    'node_modules/\ndist/\ncoverage/\n\n.env',
  )
  await writeFile(path.join(cwd, '.gitattributes'), '* text=auto eol=lf')
  await writeFile(path.join(cwd, 'tsconfig.json'), tsconfig)
  await writeFile(path.join(cwd, '.editorconfig'), editorconfig)
  await writeFile(path.join(cwd, '.prettierrc'), prettier)
  await writeFile(path.join(cwd, '.prettierignore'), 'node_modules/\n\n*.yaml')
  await writeFile(path.join(cwd, '.eslintrc.json'), eslint)

  const srcPath = path.join(cwd, 'src')

  if (!existsSync(path.join(cwd, 'src'))) {
    await mkdir(srcPath)
    await writeFile(path.join(srcPath, 'index.ts'), '')
  }

  s.stop("It's all set")
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
