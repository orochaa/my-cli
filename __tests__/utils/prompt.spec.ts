import { verifyPromptResponse } from '@/utils/prompt.js'

jest.mock('@clack/prompts', () => ({
  cancel: jest.fn(),
}))

const exitSpy = jest.spyOn(global.process, 'exit').mockImplementation()

describe('prompt', () => {
  describe('verifyPromptResponse()', () => {
    it('should end process cancel response', () => {
      const responses = [Symbol('test:symbol'), { test: Symbol('test:symbol') }]

      expect.assertions(responses.length * 2)

      for (const response of responses) {
        exitSpy.mockClear()
        verifyPromptResponse(response)
        expect(exitSpy).toHaveBeenCalledTimes(1)
        expect(exitSpy).toHaveBeenCalledWith(0)
      }
    })

    it('should not end process on primitive response', () => {
      const responses = [
        '',
        0,
        1,
        { test: '' },
        { test: 0 },
        [''],
        [0, 1],
        [{ test: '' }],
        [{ test: 0 }],
      ]

      expect.assertions(responses.length)

      for (const response of responses) {
        exitSpy.mockClear()
        verifyPromptResponse(response)
        expect(exitSpy).toHaveBeenCalledTimes(0)
      }
    })
  })
})
