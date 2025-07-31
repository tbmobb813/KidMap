// __tests__/screens/ParentLockScreen.test.tsx
import React from 'react'
import { fireEvent } from '@testing-library/react-native'
import ParentLockScreen from '@/screens/ParentLockScreen'
import { useParentalControlStore } from '@/stores/parentalControlStore'
import { renderWithProviders, setupKidMapTests } from '../helpers'

// Mock the parental control store
jest.mock('@/stores/parentalControlStore')

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('../helpers/mockAsyncStorage').createAsyncStorageMock(),
)

const mockUseParentalControlStore =
  useParentalControlStore as jest.MockedFunction<typeof useParentalControlStore>

describe('ParentLockScreen', () => {
  const mockUnlockScreen = jest.fn()

  beforeEach(() => {
    setupKidMapTests()
    jest.clearAllMocks()

    mockUseParentalControlStore.mockReturnValue({
      isLocked: true,
      unlockScreen: mockUnlockScreen,
      lockScreen: jest.fn(),
    })
  })

  it('should render parent lock screen when locked', () => {
    const { getByText } = renderWithProviders(<ParentLockScreen />)

    expect(getByText(/parent verification/i)).toBeTruthy()
  })

  it('should show unlock button', () => {
    const { getByText } = renderWithProviders(<ParentLockScreen />)

    const unlockButton = getByText(/unlock/i)
    expect(unlockButton).toBeTruthy()
  })

  it('should call unlockScreen when unlock button is pressed', () => {
    const { getByText } = renderWithProviders(<ParentLockScreen />)

    const unlockButton = getByText(/unlock/i)
    fireEvent.press(unlockButton)

    expect(mockUnlockScreen).toHaveBeenCalled()
  })

  it('should not render when not locked', () => {
    mockUseParentalControlStore.mockReturnValue({
      isLocked: false,
      unlockScreen: mockUnlockScreen,
      lockScreen: jest.fn(),
    })

    const { queryByText } = renderWithProviders(<ParentLockScreen />)

    expect(queryByText(/parent verification/i)).toBeNull()
  })
})
