import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { createSafetyErrorBoundary } from '@/utils/error/errorHandling';

describe('createSafetyErrorBoundary', () => {
  it('renders fallback when child throws and allows retry', async () => {
    const Fallback = ({ error, retry }: any) => (
      <View>
        <Text>{(error && error.message) || 'err'}</Text>
        <Pressable onPress={retry} accessibilityRole="button">
          <Text>Retry</Text>
        </Pressable>
      </View>
    );

    // Create a boundary for a fake component
    const Boundary = createSafetyErrorBoundary('TestComp', Fallback);

    const Bomb = () => {
      throw new Error('boom');
    };

    const { findByText, getByText } = render(
      <Boundary>
        <Bomb />
      </Boundary>
    );

    // Fallback should show message (use async find to be robust)
    const node = await findByText('boom');
    expect(node).toBeTruthy();
    // Retry button should exist and be pressable
    const btn = getByText('Retry');
    expect(btn).toBeTruthy();
    // Press retry to ensure nothing throws
    fireEvent.press(btn);
  });
});
