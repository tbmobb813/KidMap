import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccessibleButton from '../components/AccessibleButton';

describe('AccessibleButton', () => {
  it('renders with correct title and handles press', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AccessibleButton title="Test Button" onPress={onPressMock} />
    );
    const button = getByText('Test Button');
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalled();
  });
});
