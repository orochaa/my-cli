import { verifyPromptResponse } from '@/utils/prompt'

const exitSpy = jest.spyOn(global.process, 'exit')
exitSpy.mockImplementation(() => ({} as never))

describe('prompt', () => {
  describe('verifyPromptResponse()', () => {
    it('should end process cancel response', () => {
      const responses = [Symbol(), { test: Symbol() }, undefined]

      expect.assertions(responses.length * 2)
      for (const response of responses) {
        exitSpy.mockClear()
        verifyPromptResponse(response)
        expect(exitSpy).toHaveBeenCalledTimes(1)
        expect(exitSpy).toHaveBeenCalledWith(0)
      }
    })

    it('should not end process on primitive response', () => {
      const responses = new Array().concat(
        ['', 0, 1, { test: '' }, { test: 0 }],
        [[''], [0, 1], [{ test: '' }], [{ test: 0 }]]
      )

      expect.assertions(responses.length)
      for (const response of responses) {
        exitSpy.mockClear()
        verifyPromptResponse(response)
        expect(exitSpy).toHaveBeenCalledTimes(0)
      }
    })
  })
})
