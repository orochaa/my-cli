import { rmSync } from 'node:fs'
import path from 'node:path'
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
    '@': path.resolve('src'),
  },
  hooks: {
    'build:done': () => {
      rmSync(path.resolve('bin/index.mjs'))
    },
  },
})
