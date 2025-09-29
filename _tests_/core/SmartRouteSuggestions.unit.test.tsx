import React from 'react';

import { render, fireEvent } from '../testUtils';

const destination = { id: 'dest-1', name: 'Destination' } as any;

// Require the component after test-utils import (do not reset modules here — that would remove
// test-utils' lifecycle hooks and lead to invalid hook calls inside components)
const SmartRouteSuggestions = require('@/components/SmartRouteSuggestions').default;

describe('SmartRouteSuggestions', () => {
  it('renders prioritized suggestions and calls onSelectRoute when pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <SmartRouteSuggestions
        destination={destination}
        _currentLocation={{ latitude: 0, longitude: 0 }}
        weather="rainy"
        timeOfDay="morning"
        onSelectRoute={onSelect}
      />
    );

    // Header present
    expect(getByText(/Smart Route Suggestions/)).toBeTruthy();

    // The component limits to top 3 suggestions; check one of them (Covered Route)
    const covered = getByText(/Covered Route/);
    expect(covered).toBeTruthy();

    fireEvent.press(covered);
    expect(onSelect).toHaveBeenCalled();
  });
});
