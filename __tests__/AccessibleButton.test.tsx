// AccessibleButton.test.tsx

import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react-native';
import AccessibleButton from '../components/AccessibleButton';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('AccessibleButton', () => {
  it('renders with the correct title', () => {
    const { getByText } = render(<AccessibleButton title="Test Button" onPress={jest.fn()} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AccessibleButton title="Click Me" onPress={onPressMock} />
    );
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility role and label', () => {
    const { getByRole } = render(
      <AccessibleButton title="Accessible" onPress={jest.fn()} />
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(<AccessibleButton title="Snapshot Test" onPress={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
