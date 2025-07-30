// __tests__/MapScreen.test.tsx
import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import MapScreen from '@/screens/MapScreen';
import { useNavigationStore } from '@/stores/navigationStore';
import useLocation from '@/hooks/useLocation';
import { renderWithProviders, setupKidMapTests } from '../helpers';

// Mocks
jest.mock('@/hooks/useLocation');
jest.mock('@/stores/navigationStore', () => ({
  useNavigationStore: jest.fn(),
}));

describe('MapScreen', () => {
  const mockClearRoute = jest.fn();

  beforeEach(() => {
    setupKidMapTests();
    jest.clearAllMocks();

    // Default mock location
    (useLocation as jest.Mock).mockReturnValue({
      location: { latitude: 40.7128, longitude: -74.006 },
      errorMsg: null,
    });

    // Default store state
    (useNavigationStore as jest.Mock).mockReturnValue({
      origin: { latitude: 1, longitude: 2 },
      destination: { latitude: 3, longitude: 4 },
      availableRoutes: [{ id: 'route-1' }],
      selectRoute: jest.fn(),
      clearRoute: mockClearRoute,
    });
  });

  it('renders location when available', async () => {
    const { getByTestId } = renderWithProviders(<MapScreen />);
    await waitFor(() => expect(getByTestId('location-text')).toBeTruthy());
  });

  it('renders loading text if no location yet', async () => {
    (useLocation as jest.Mock).mockReturnValueOnce({
      location: null,
      errorMsg: null,
    });
    const { getByTestId } = renderWithProviders(<MapScreen />);
    expect(getByTestId('location-loading')).toBeTruthy();
  });

  it('displays route count if availableRoutes exist', () => {
    const { getByTestId } = renderWithProviders(<MapScreen />);
    expect(getByTestId('route-count').props.children).toContain(1);
  });

  it('triggers clearRoute when button is pressed', () => {
    const { getByTestId } = renderWithProviders(<MapScreen />);
    fireEvent.press(getByTestId('clear-route-button'));
    expect(mockClearRoute).toHaveBeenCalled();
  });

  it('displays error if location has error', () => {
    (useLocation as jest.Mock).mockReturnValueOnce({
      location: null,
      errorMsg: 'Permission denied',
    });

    const { getByText } = renderWithProviders(<MapScreen />);
    expect(getByText(/permission denied/i)).toBeTruthy();
  });
});
