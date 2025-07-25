// ui.test.tsx

import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react-native';
import ParentDashboard from '@/components/ParentDashboard';

jest.mock('@/utils/pingDevice', () => ({
  pingDevice: jest.fn(),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('UI/UX Testing - ParentDashboard', () => {
  it('should render the Parent Dashboard correctly', () => {
    const { toJSON, getByText } = render(<ParentDashboard />);

    expect(getByText("Ping Child's Device")).toBeTruthy();
    expect(getByText('Manage Safe Zones')).toBeTruthy();

    // Snapshot for UI structure
    expect(toJSON()).toMatchSnapshot();
  });

  it('should trigger ping action when "Ping Child\'s Device" button is pressed', () => {
    const { pingDevice } = require('@/utils/pingDevice');
    const { getByText } = render(<ParentDashboard />);

    fireEvent.press(getByText("Ping Child's Device"));
    expect(pingDevice).toHaveBeenCalledTimes(1);
  });

  it('should navigate or trigger action when "Manage Safe Zones" button is pressed', () => {
    // If this button triggers navigation or another action, spy on it here.
    // Example: If using expo-router
    const mockNavigation = jest.fn();
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({ push: mockNavigation });

    const { getByText } = render(<ParentDashboard />);
    fireEvent.press(getByText('Manage Safe Zones'));

    // Verify navigation/action
    expect(mockNavigation).toHaveBeenCalledTimes(1);
  });
});
