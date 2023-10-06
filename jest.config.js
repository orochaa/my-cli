/** @type {import('jest').Config} */
export default {
  bail: true,
  clearMocks: true,
  collectCoverage: false,
  maxWorkers: 1,
  roots: ['<rootDir>/__tests__'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': '@swc/jest'
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/tests/(.*).js$': '<rootDir>/__tests__/$1',
    '^@/(.*).js$': '<rootDir>/src/$1'
  },
  testRegex: ['__tests__/.+.spec.ts']
}
