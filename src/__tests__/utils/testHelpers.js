const testLogger = require('./testLogger')

// Enhanced test utilities focused on data logging
const testHelpers = {
  // Wrap test functions with result logging
  loggedTest: (testName, testFn) => {
    return async (...args) => {
      const startTime = Date.now()
      try {
        const result = await testFn(...args)
        const duration = Date.now() - startTime
        testLogger.logTestResult(testName, 'PASS', duration, { result })
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        testLogger.logTestFailure(testName, error, { duration, args })
        testLogger.logTestResult(testName, 'FAIL', duration)
        throw error
      }
    }
  },

  // Enhanced component rendering with detailed logging
  renderWithLogging: (
    render,
    component,
    componentName = 'Component',
    props = {},
  ) => {
    try {
      const renderResult = render(component)
      testLogger.logComponentRender(componentName, props, renderResult)
      return renderResult
    } catch (error) {
      testLogger.logTestFailure(`${componentName} render`, error, { props })
      throw error
    }
  },

  // Enhanced mock with return value logging
  createLoggedMock: (mockName, mockImplementation) => {
    return jest.fn((...args) => {
      const returnValue = mockImplementation
        ? mockImplementation(...args)
        : undefined
      testLogger.logMockCall(mockName, args, returnValue)
      return returnValue
    })
  },

  // Enhanced assertions with detailed result logging
  expectWithLog: (description, actual) => {
    return {
      toBe: (expected) => {
        try {
          const result = expect(actual).toBe(expected)
          testLogger.logAssertion(description, expected, actual, true)
          return result
        } catch (error) {
          testLogger.logAssertion(description, expected, actual, false)
          throw error
        }
      },
      toEqual: (expected) => {
        try {
          const result = expect(actual).toEqual(expected)
          testLogger.logAssertion(description, expected, actual, true)
          return result
        } catch (error) {
          testLogger.logAssertion(description, expected, actual, false)
          throw error
        }
      },
      toBeTruthy: () => {
        try {
          const result = expect(actual).toBeTruthy()
          testLogger.logAssertion(description, 'truthy', actual, true)
          return result
        } catch (error) {
          testLogger.logAssertion(description, 'truthy', actual, false)
          throw error
        }
      },
      toBeFalsy: () => {
        try {
          const result = expect(actual).toBeFalsy()
          testLogger.logAssertion(description, 'falsy', actual, true)
          return result
        } catch (error) {
          testLogger.logAssertion(description, 'falsy', actual, false)
          throw error
        }
      },
      toHaveBeenCalled: () => {
        try {
          const result = expect(actual).toHaveBeenCalled()
          testLogger.logAssertion(
            description,
            'called',
            'mock was called',
            true,
          )
          return result
        } catch (error) {
          testLogger.logAssertion(
            description,
            'called',
            'mock was not called',
            false,
          )
          throw error
        }
      },
      toHaveBeenCalledWith: (...expectedArgs) => {
        try {
          const result = expect(actual).toHaveBeenCalledWith(...expectedArgs)
          testLogger.logAssertion(
            description,
            expectedArgs,
            'mock called with expected args',
            true,
          )
          return result
        } catch (error) {
          testLogger.logAssertion(
            description,
            expectedArgs,
            'mock called with different args',
            false,
          )
          throw error
        }
      },
    }
  },

  // Component interaction helpers
  logUserInteraction: (componentName, action, element, result = {}) => {
    testLogger.logComponentInteraction(componentName, action, {
      element: element.type || 'unknown',
      result,
    })
  },

  // API testing helpers
  logApiTest: (endpoint, method, requestData, responseData, expectedStatus) => {
    const actualStatus = responseData?.status || 'unknown'
    testLogger.logApiCall(
      endpoint,
      method,
      requestData,
      responseData,
      actualStatus,
    )
    return {
      status: actualStatus,
      data: responseData?.data,
      passed: actualStatus === expectedStatus,
    }
  },
}

module.exports = { testLogger, ...testHelpers }
