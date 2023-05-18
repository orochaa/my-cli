import { resolve } from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
    esbuild: {
      minify: true
    }
  },
  alias: {
    '@': resolve('src')
  },
  clean: true
})
