const { testLogger, expectWithLog } = require('./utils/testHelpers')

describe('Basic Tests', () => {
  test('math operations', () => {
    // Log the test data and calculations
    const testData = {
      operation1: { a: 2, b: 2, expected: 4 },
      operation2: { a: 5, b: 3, expected: 15 },
    }

    testLogger.info(`📊 MATH_TEST_DATA: ${JSON.stringify(testData)}`)

    // Test with detailed assertion logging
    expectWithLog('Addition: 2 + 2 = 4', 2 + 2).toBe(4)
    expectWithLog('Multiplication: 5 * 3 = 15', 5 * 3).toBe(15)

    // Log additional calculations for data analysis
    const calculations = {
      sum: testData.operation1.a + testData.operation1.b,
      product: testData.operation2.a * testData.operation2.b,
      allCorrect: 2 + 2 === 4 && 5 * 3 === 15,
    }

    testLogger.info(`🧮 CALCULATION_RESULTS: ${JSON.stringify(calculations)}`)
  })

  test('string operations', () => {
    // Log string test data
    const stringTestData = {
      baseString: 'test',
      concatParts: ['Hello', ' World'],
      expectedResults: {
        concat: 'Hello World',
        uppercase: 'TEST',
      },
    }

    testLogger.info(`📝 STRING_TEST_DATA: ${JSON.stringify(stringTestData)}`)

    // Test string operations with result logging
    const concatResult = 'Hello' + ' World'
    const uppercaseResult = 'test'.toUpperCase()

    expectWithLog(
      'String concatenation produces correct result',
      concatResult,
    ).toBe('Hello World')
    expectWithLog('String uppercase conversion', uppercaseResult).toBe('TEST')

    // Log the actual string processing results
    const stringResults = {
      originalString: stringTestData.baseString,
      concatenatedString: concatResult,
      uppercasedString: uppercaseResult,
      lengths: {
        original: stringTestData.baseString.length,
        concatenated: concatResult.length,
        uppercased: uppercaseResult.length,
      },
    }

    testLogger.info(
      `🔤 STRING_PROCESSING_RESULTS: ${JSON.stringify(stringResults)}`,
    )
  })
})
