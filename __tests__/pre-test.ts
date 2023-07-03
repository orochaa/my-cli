// `open` uses ESM, it generate conflict with jest commonjs
jest.mock('open', () => {})
