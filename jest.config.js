/** @type {import('jest').Config} */
module.exports = {
  bail: true,
  roots: ['<rootDir>/__tests__'],
  clearMocks: true,
  collectCoverage: false,
  maxWorkers: 1,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': '@swc/jest'
  },
  moduleNameMapper: {
    '@/tests/(.*)': '<rootDir>/__tests__/$1',
    '@/(.*)': '<rootDir>/src/$1'
  },
  testRegex: ['__tests__/.+.spec.ts'],
  setupFiles: ['<rootDir>/__tests__/pre-test.ts']
}
