// __tests__/utils/routing.test.tsx - Routing utility tests
import { fetchRoute } from '../utils/api'
const { testLogger, expectWithLog } = require('./utils/testHelpers')

// Mock the API module
jest.mock('../utils/api')

describe('Routing Functions', () => {
  beforeEach(() => {
    testLogger.info('Setting up routing test')
    jest.clearAllMocks()
  })

  test('fetchRoute returns valid route', async () => {
    testLogger.info('Testing route fetching')

    const mockRoute = {
      distance: 1000,
      duration: 600,
      steps: [{ instruction: 'Head north', distance: 500 }],
    }

    ;(fetchRoute as jest.Mock).mockResolvedValue(mockRoute)

    const result = await fetchRoute([37.7749, -122.4194], [37.7849, -122.4094])

    testLogger.debug(`Route result: ${JSON.stringify(result)}`)
    expectWithLog('Route should have distance', result.distance).toBe(1000)
    expectWithLog('Route should have steps', result.steps.length > 0).toBe(true)

    testLogger.info('Route fetching test completed')
  })
})
