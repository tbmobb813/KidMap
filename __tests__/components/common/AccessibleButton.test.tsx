// AccessibleButton.test.tsx

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import AccessibleButton from '@/components/AccessibleButton'
const {
  testLogger,
  renderWithLogging,
  expectWithLog,
} = require('../../utils/testHelpers')

describe('AccessibleButton', () => {
  test('renders correctly', () => {
    testLogger.info('Testing AccessibleButton render')

    const { getByText } = renderWithLogging(
      render,
      <AccessibleButton title="Test Button" onPress={() => {}} />,
      'AccessibleButton',
    )

    expectWithLog(
      'Button text should be visible',
      getByText('Test Button'),
    ).toBeTruthy()

    testLogger.info('AccessibleButton render test completed')
  })

  test('handles press events', () => {
    testLogger.info('Testing AccessibleButton press functionality')

    const mockPress = jest.fn()
    testLogger.mockCall('onPress', [])

    const { getByText } = renderWithLogging(
      render,
      <AccessibleButton title="Press Me" onPress={mockPress} />,
      'AccessibleButton with onPress',
    )

    const button = getByText('Press Me')
    fireEvent.press(button)

    expectWithLog(
      'onPress should be called',
      expect(mockPress).toHaveBeenCalled(),
    )

    testLogger.info('AccessibleButton press test completed')
  })
})
