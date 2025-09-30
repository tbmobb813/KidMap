import { auditTouchTarget } from '@/utils/accessibility/touchTargetAudit';

describe('touchTargetAudit', () => {
  it('passes when effective size meets MIN_TOUCH_TARGET with numeric hitSlop', () => {
    const passes = auditTouchTarget({ name: 'btn', minWidth: 40, minHeight: 40, hitSlop: 4 });
    expect(passes).toBe(true);
  });

  it('fails when effective size less than MIN_TOUCH_TARGET', () => {
    const passes = auditTouchTarget({ name: 'small', minWidth: 10, minHeight: 10 });
    expect(passes).toBe(false);
  });
});
