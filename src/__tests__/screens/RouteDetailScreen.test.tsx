import React from 'react'
import { render } from '@testing-library/react-native'
import RouteDetailScreen from '../app/route/[id]'
const {
  testLogger,
  renderWithLogging,
  expectWithLog,
} = require('./utils/testHelpers')

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'test-route-123' }),
  useRouter: () => ({ back: jest.fn() }),
}))

describe('RouteDetailScreen', () => {
  test('renders route details', () => {
    testLogger.info('Testing RouteDetailScreen render')

    const { getByText } = renderWithLogging(
      render,
      <RouteDetailScreen />,
      'RouteDetailScreen',
    )

    expectWithLog(
      'Route details should be visible',
      getByText(/route/i),
    ).toBeTruthy()

    testLogger.info('RouteDetailScreen test completed')
  })
})
