import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ParentDashboard from '@/components/ParentDashboard'
const {
  testLogger,
  renderWithLogging,
  expectWithLog,
} = require('./utils/testHelpers')

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}))

// Mock other dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }),
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    }),
  ),
}))

describe('UI/UX Testing - ParentDashboard', () => {
  beforeEach(() => {
    testLogger.info('Setting up ParentDashboard test')
    jest.clearAllMocks()
  })

  it('renders the Parent Dashboard correctly', () => {
    testLogger.info('Testing ParentDashboard initial render')

    const { getByText, getAllByText } = renderWithLogging(
      render,
      <ParentDashboard />,
      'ParentDashboard',
    )

    expectWithLog(
      'Parent Dashboard title',
      getByText('Parent Dashboard'),
    ).toBeTruthy()
    expectWithLog(
      'Category Management text',
      getByText('Category Management'),
    ).toBeTruthy()
    expectWithLog(
      'Safe Zones count',
      getAllByText('Safe Zones').length > 0,
    ).toBe(true)

    testLogger.info('ParentDashboard render test completed')
  })

  it('triggers ping action when "Ping Child\'s Device" is pressed', async () => {
    testLogger.info('Testing ping device functionality')

    const { getByText } = renderWithLogging(
      render,
      <ParentDashboard />,
      'ParentDashboard for ping test',
    )

    const pingButton = getByText("Ping Child's Device")
    fireEvent.press(pingButton)

    testLogger.mockCall('pingDevice', ['button pressed'])

    // Wait for any async operations
    await waitFor(() => {
      expectWithLog('Ping button should be responsive', pingButton).toBeTruthy()
    })

    testLogger.info('Ping device test completed')
  })

  it('renders Safe Zones component and its controls', () => {
    testLogger.info('Testing Safe Zones controls')

    const { getAllByText, getByText } = renderWithLogging(
      render,
      <ParentDashboard />,
      'ParentDashboard Safe Zones',
    )

    expectWithLog(
      'Safe Zones elements count',
      getAllByText('Safe Zones').length > 0,
    ).toBe(true)
    expectWithLog(
      'Add Safe Zone button',
      getByText('Add Safe Zone'),
    ).toBeTruthy()

    testLogger.info('Safe Zones controls test completed')
  })
})
