import { clearParams, mockParams } from '@/tests/mocks/mock-params'
import { runCommand } from '@/commands'
import cp from 'node:child_process'

jest.spyOn(global.process, 'exit').mockImplementation(() => ({} as never))

jest.mock('@clack/prompts', () => ({
  multiselect: jest.fn(async () => ['lint', 'build'])
}))

jest.spyOn(cp, 'execSync').mockImplementation(() => ({} as any))

describe('runCommand', () => {
  beforeEach(() => {
    clearParams()
  })

  it("should run prompt's selected scripts", async () => {
    await runCommand()

    expect(cp.execSync).toHaveBeenCalledTimes(2)
    expect(cp.execSync).toHaveBeenCalledWith('npm run lint', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('npm run build', expect.anything())
  })

  it("should run prompt's selected scripts", async () => {
    mockParams('lint', 'build', 'test')

    await runCommand()

    expect(cp.execSync).toHaveBeenCalledTimes(3)
    expect(cp.execSync).toHaveBeenCalledWith('npm run lint', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('npm run build', expect.anything())
    expect(cp.execSync).toHaveBeenCalledWith('npm run test', expect.anything())
  })

  it('should verify package.json scripts', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({})

    await runCommand()

    expect(process.exit).toHaveBeenCalledTimes(1)
  })

  it('should verify if script exists in package.json', async () => {
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({
      scripts: {}
    })
    mockParams('lint')

    await runCommand()

    expect(process.exit).toHaveBeenCalledTimes(1)
  })
})
