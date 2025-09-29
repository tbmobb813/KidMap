import { render } from '@testing-library/react-native';
import React from 'react';

import AccessibleButton from '@/components/AccessibleButton';
import * as audit from '@/utils/accessibility/touchTargetAudit';

describe('AccessibleButton hitSlop forwarding', () => {
  it('forwards hitSlop to Pressable and includes it in touch target audit', () => {
    const spy = jest.spyOn(audit, 'auditTouchTarget');
    render(<AccessibleButton title="Test" onPress={() => {}} hitSlop={12} />);
    expect(spy).toHaveBeenCalled();
    const calledWith = spy.mock.calls.find(c => c && c[0] && c[0].name === 'AccessibleButton');
    expect(calledWith).toBeDefined();
    // auditTouchTarget receives hitSlop we provided (or number form)
    expect(calledWith![0].hitSlop).toBe(12);
    spy.mockRestore();
  });
});
