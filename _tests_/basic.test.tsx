import React from 'react';
import { Text } from 'react-native';

import { render } from './testUtils';

describe('Smoke test', () => {
  it('renders a basic text', () => {
    const { getByText } = render(<Text>KidMap</Text>);
    expect(getByText('KidMap')).toBeTruthy();
  });
});
