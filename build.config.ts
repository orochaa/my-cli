import { resolve } from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  rollup: {
    inlineDependencies: true,
    emitCJS: true
  },
  alias: {
    '@': resolve('src')
  },
  clean: true,
  declaration: true
})
