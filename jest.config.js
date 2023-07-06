/** @type {import('jest').Config} */
module.exports = {
  bail: true,
  clearMocks: true,
  collectCoverage: false,
  roots: ['<rootDir>/__tests__'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': '@swc/jest'
  },
  moduleNameMapper: {
    '@/tests/(.*)': '<rootDir>/__tests__/$1',
    '@/(.*)': '<rootDir>/src/$1'
  },
  testRegex: ['__tests__/.+.spec.ts'],
  setupFiles: ['<rootDir>/__tests__/pre-test.ts']
}
