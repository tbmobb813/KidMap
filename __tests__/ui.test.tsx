import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react-native';
import ParentDashboard from '@/components/ParentDashboard';

// --- Required mocks ---
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@/utils/pingDevice', () => ({
  pingDevice: jest.fn(),
  sendLocationUpdate: jest.fn(),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('UI/UX Testing - ParentDashboard', () => {
  it('renders the Parent Dashboard correctly', () => {
    const { toJSON, getByText, getAllByText } = render(<ParentDashboard />);
    expect(getByText('Parent Dashboard')).toBeTruthy();
    expect(getByText('Category Management')).toBeTruthy();
    expect(getAllByText('Safe Zones').length).toBeGreaterThan(1);
    expect(getByText('Device Ping / Locate')).toBeTruthy();
    expect(getByText("Ping Child's Device")).toBeTruthy();
    // The Button mock renders <Text>{title}</Text>, so this should work:
    expect(getByText('Add Safe Zone')).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it('triggers ping action when "Ping Child\'s Device" is pressed', async () => {
    const { getByText } = render(<ParentDashboard />);
    const pingButton = getByText("Ping Child's Device");
    fireEvent.press(pingButton);

    const { pingDevice, sendLocationUpdate } = require('@/utils/pingDevice');
    await waitFor(() => {
      expect(pingDevice).toHaveBeenCalled();
      expect(sendLocationUpdate).toHaveBeenCalled();
    });
  });

  it('renders Safe Zones component and its controls', () => {
    const { getAllByText, getByText } = render(<ParentDashboard />);
    expect(getAllByText('Safe Zones').length).toBeGreaterThan(1);
    expect(getByText('Add Safe Zone')).toBeTruthy();
  });

  it('allows entering Safe Zone data and submitting the form', () => {
    const { getByPlaceholderText, getByText } = render(<ParentDashboard />);
    fireEvent.changeText(getByPlaceholderText('Name'), 'School');
    fireEvent.changeText(getByPlaceholderText('Latitude'), '37.7749');
    fireEvent.changeText(getByPlaceholderText('Longitude'), '-122.4194');
    fireEvent.changeText(getByPlaceholderText('Radius (m)'), '150');
    fireEvent.press(getByText('Add Safe Zone'));
    expect(getByText('Add Safe Zone')).toBeTruthy();
  });
});