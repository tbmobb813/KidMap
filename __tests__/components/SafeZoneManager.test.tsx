import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { setupMockAsyncStorage } from '../helpers/mockAsyncStorage';
import { fillSafeZoneForm, createMockZone } from '../helpers/safeZoneTestHelpers';

// Minimal mocks required for rendering the form
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

jest.mock('@/constants/colors', () => ({
  default: {
    primary: '#4A80F0',
    secondary: '#67D295',
    accent: '#FF6B35',
    background: '#FFFFFF',
    card: '#F8F9FA',
    text: {
      primary: '#333333',
      secondary: '#757575',
      primaryLight: '#9E9E9E',
    },
    error: '#FF6B6B',
    success: '#4CAF50',
    border: '#E0E0E0',
    white: '#FFFFFF',
  },
}));

jest.mock('@/components/SafetyErrorBoundary', () => {
  return function MockSafetyErrorBoundary({ children }: { children: React.ReactNode }) {
    return children;
  };
});

// Use our comprehensive AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => 
  require('../helpers/mockAsyncStorage').createAsyncStorageMock()
);

import SafeZoneManager from '@/components/SafeZoneManager';

jest.spyOn(Alert, 'alert');

describe('SafeZoneManager (UI only)', () => {
  beforeEach(() => {
    setupMockAsyncStorage();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<SafeZoneManager />);
    expect(getByText('Safe Zones')).toBeTruthy();
  });

  it('renders form inputs', () => {
    const { getByPlaceholderText } = renderWithProviders(<SafeZoneManager />);
    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Latitude')).toBeTruthy();
    expect(getByPlaceholderText('Longitude')).toBeTruthy();
    expect(getByPlaceholderText('Radius (m)')).toBeTruthy();
  });

  it('shows validation error for empty name', async () => {
    const { getByText } = renderWithProviders(<SafeZoneManager />);
    fireEvent.press(getByText('Add Safe Zone'));
    
    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
    });
  });

  it('should use safe zone helper for form filling', async () => {
    const renderResult = renderWithProviders(<SafeZoneManager />);
    
    // Use our helper to fill the form
    fillSafeZoneForm(renderResult, {
      name: 'Test Zone',
      latitude: '40.7128',
      longitude: '-74.0060',
      radius: '100',
    });
    
    fireEvent.press(renderResult.getByText('Add Safe Zone'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Safe zone created successfully');
    });
  });

  it('should work with mock zone data', () => {
    const mockZone = createMockZone({
      name: 'Helper Test Zone',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 200,
    });

    expect(mockZone.name).toBe('Helper Test Zone');
    expect(mockZone.latitude).toBe(37.7749);
    expect(mockZone.radius).toBe(200);
  });
});

describe('SafeZone Alert Logic', () => {
  it('should accept valid form input and trigger alert', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<SafeZoneManager />);
    fireEvent.changeText(getByPlaceholderText('Name'), 'Test Zone');
    fireEvent.changeText(getByPlaceholderText('Latitude'), '40.7128');
    fireEvent.changeText(getByPlaceholderText('Longitude'), '-74.0060');
    fireEvent.changeText(getByPlaceholderText('Radius (m)'), '100');
    fireEvent.press(getByText('Add Safe Zone'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Safe zone created successfully');
    });
  });
});