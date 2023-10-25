import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  outDir: 'bin',
  clean: true,
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
  alias: {
    '@': resolve('src'),
  },
  hooks: {
    'build:done': () => {
      rmSync(resolve('bin/index.mjs'))
    },
  },
})
