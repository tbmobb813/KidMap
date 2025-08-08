import { renderHook } from '@testing-library/react-hooks'
import { useCustomHook } from '../src/hooks/useCustomHook'
const { testLogger, expectWithLog } = require('./utils/testHelpers')

describe('React Hooks Tests', () => {
  test('custom hook functionality', () => {
    testLogger.info('Testing custom hook')

    const { result } = renderHook(() => useCustomHook())

    expectWithLog('Hook initial value', result.current.value).toBe(
      'hello world',
    )

    testLogger.info('Custom hook test completed')
  })
})
