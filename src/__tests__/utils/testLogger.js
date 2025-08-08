const fs = require('fs')
const path = require('path')

class TestLogger {
  constructor() {
    // Find the project root by looking for package.json
    const projectRoot = this.findProjectRoot()
    this.logDir = path.join(projectRoot, 'logs', 'debug')
    this.ensureLogDir()
  }

  findProjectRoot() {
    let currentDir = __dirname
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir
      }
      currentDir = path.dirname(currentDir)
    }
    // Fallback to two levels up if package.json not found
    return path.join(__dirname, '../..')
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  getLogFile() {
    const date = new Date().toISOString().slice(0, 10)
    return path.join(this.logDir, `test-debug-${date}.log`)
  }

  formatMessage(message, level = 'INFO') {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] ${message}`
  }

  writeLog(message, level = 'INFO') {
    const formattedMessage = this.formatMessage(message, level)
    const logFile = this.getLogFile()

    try {
      fs.appendFileSync(logFile, formattedMessage + '\n')
      console.log(`🔍 ${formattedMessage}`)
    } catch (error) {
      console.error('Failed to write to log file:', error.message)
    }
  }

  info(message) {
    this.writeLog(message, 'INFO')
  }

  debug(message) {
    this.writeLog(message, 'DEBUG')
  }

  warn(message) {
    this.writeLog(message, 'WARN')
  }

  error(message) {
    this.writeLog(message, 'ERROR')
  }

  // Test data logging - focus on results and information
  logTestResult(testName, status, duration, details = {}) {
    const result = {
      test: testName,
      status: status, // 'PASS', 'FAIL', 'SKIP'
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...details,
    }
    this.info(`📊 TEST_RESULT: ${JSON.stringify(result)}`)
  }

  logTestFailure(testName, error, context = {}) {
    const failure = {
      test: testName,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join(' | '), // First 3 lines of stack
      context: context,
      timestamp: new Date().toISOString(),
    }
    this.error(`💥 TEST_FAILURE: ${JSON.stringify(failure)}`)
  }

  // Component data logging
  logComponentRender(componentName, props = {}, renderResult = {}) {
    const renderData = {
      component: componentName,
      props: this.sanitizeProps(props),
      rendered: this.extractRenderInfo(renderResult),
      timestamp: new Date().toISOString(),
    }
    this.info(`🎨 COMPONENT_RENDER: ${JSON.stringify(renderData)}`)
  }

  logComponentInteraction(componentName, interaction, result = {}) {
    const interactionData = {
      component: componentName,
      action: interaction,
      result: result,
      timestamp: new Date().toISOString(),
    }
    this.info(`👆 COMPONENT_INTERACTION: ${JSON.stringify(interactionData)}`)
  }

  // API and data logging
  logApiCall(endpoint, method, requestData, responseData, status) {
    const apiData = {
      endpoint,
      method,
      request: this.sanitizeData(requestData),
      response: this.sanitizeData(responseData),
      status,
      timestamp: new Date().toISOString(),
    }
    this.info(`🌐 API_CALL: ${JSON.stringify(apiData)}`)
  }

  logMockCall(mockName, args, returnValue) {
    const mockData = {
      mock: mockName,
      arguments: this.sanitizeData(args),
      returned: this.sanitizeData(returnValue),
      timestamp: new Date().toISOString(),
    }
    this.debug(`🎭 MOCK_CALL: ${JSON.stringify(mockData)}`)
  }

  // Assertion logging with detailed comparison
  logAssertion(description, expected, actual, passed) {
    const assertionData = {
      description,
      expected: this.sanitizeData(expected),
      actual: this.sanitizeData(actual),
      passed,
      timestamp: new Date().toISOString(),
    }
    const level = passed ? 'DEBUG' : 'WARN'
    this.writeLog(`🔍 ASSERTION: ${JSON.stringify(assertionData)}`, level)
  }

  // Data utility methods
  sanitizeData(data) {
    if (data === null || data === undefined) return data
    if (typeof data === 'function') return '[Function]'
    if (data instanceof Error) return { message: data.message, name: data.name }
    if (
      typeof data === 'object' &&
      data.constructor &&
      data.constructor.name !== 'Object'
    ) {
      return `[${data.constructor.name} object]`
    }
    try {
      return JSON.parse(JSON.stringify(data)) // Deep clone and remove functions
    } catch (error) {
      return '[Unserializable object]'
    }
  }

  sanitizeProps(props) {
    const sanitized = {}
    for (const [key, value] of Object.entries(props || {})) {
      sanitized[key] = this.sanitizeData(value)
    }
    return sanitized
  }

  extractRenderInfo(renderResult) {
    if (!renderResult) return null

    try {
      // For @testing-library/react-native
      if (renderResult.container) {
        return {
          type: 'testing-library',
          hasContainer: true,
          queryMethods: Object.keys(renderResult).filter((key) =>
            key.startsWith('query'),
          ).length,
        }
      }

      // For enzyme or other renderers
      if (renderResult.find) {
        return {
          type: 'enzyme',
          hasFindMethod: true,
        }
      }

      return { type: 'unknown', keys: Object.keys(renderResult).slice(0, 5) }
    } catch (error) {
      return { error: 'Failed to extract render info' }
    }
  }
}

// Export singleton instance
module.exports = new TestLogger()
