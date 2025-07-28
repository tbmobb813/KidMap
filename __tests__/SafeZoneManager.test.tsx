import React from 'react';
import { render } from '@testing-library/react-native';
import SafeZoneManager from '@/components/SafeZoneManager';

describe('SafeZoneManager', () => {
  it('should render without crashing', () => {
    const { getByText } = render(
      <SafeZoneManager 
        safeZones={[]} 
        onSafeZonesChange={() => {}} 
      />
    );
    // Basic smoke test - component renders
    expect(getByText).toBeDefined();
  });
});