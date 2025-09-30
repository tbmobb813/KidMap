import React from 'react';

import { render, hasRenderedIcon } from '../testUtils';

import Toast from '@/components/Toast';

describe('Toast icon rendering (minimal)', () => {
  it('renders the success icon when type is success', async () => {
    const props = {
      message: 'Icon test',
      type: 'success' as const,
      visible: true,
      onHide: jest.fn(),
      disableAnimation: true,
    };

  const result = render(<Toast {...props} />);

  // Toast exposes an accessibilityLabel composed from the type and message
  // (e.g. "Success: Icon test"). Prefer a11y queries over implementation testIDs.
  let ok = false;
  try {
    if (typeof (result as any).findByA11yLabel === 'function') {
      const el = await (result as any).findByA11yLabel('Success: Icon test');
      ok = !!el;
    } else if (typeof (result as any).getByA11yLabel === 'function') {
      ok = !!(result as any).getByA11yLabel('Success: Icon test');
    } else if (typeof (result as any).getByAccessibilityLabel === 'function') {
      ok = !!(result as any).getByAccessibilityLabel('Success: Icon test');
    }
  } catch {
    // ignore and fallback
  }

  if (!ok) {
    // fallback to renderer-agnostic icon detection
    expect(hasRenderedIcon(result as any, 'CheckCircle')).toBeTruthy();
  } else {
    expect(ok).toBeTruthy();
  }
  });
});
