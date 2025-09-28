import { render } from '@testing-library/react-native';
import React from 'react';

import { createTestWrapper } from '@/_tests_/testUtils';
import Toast from '@/components/Toast';

const renderWithTheme = (ui: React.ReactElement) =>
  render(ui, { wrapper: createTestWrapper() });

describe('Toast Component (minimal)', () => {
  it('renders the basic toast when visible with animations disabled', () => {
    const props = {
      message: 'Minimal test',
      type: 'info' as const,
      visible: true,
      onHide: jest.fn(),
      disableAnimation: true,
    };

    const { getByTestId, getByText } = renderWithTheme(<Toast {...props} />);

    expect(getByTestId('toast-alert')).toBeTruthy();
    expect(getByText('Minimal test')).toBeTruthy();
  });
});
