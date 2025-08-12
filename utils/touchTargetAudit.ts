// Dev-only touch target size audit utility.
// Ensures interactive components meet recommended minimum of 48x48 logical pixels (WCAG / platform guidance).

export const MIN_TOUCH_TARGET = 48;

export interface TouchTargetMetrics {
    name: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    hitSlop?: { top?: number; right?: number; bottom?: number; left?: number } | number;
}

function extractHitSlopPadding(hitSlop: TouchTargetMetrics['hitSlop']): { horiz: number; vert: number } {
    if (!hitSlop) return { horiz: 0, vert: 0 };
    if (typeof hitSlop === 'number') return { horiz: hitSlop * 2, vert: hitSlop * 2 };
    const { left = 0, right = 0, top = 0, bottom = 0 } = hitSlop;
    return { horiz: left + right, vert: top + bottom };
}

export function auditTouchTarget(metrics: TouchTargetMetrics): boolean {
    if (process.env.NODE_ENV === 'production') return true; // no-op in prod
    const { name, width, height, minWidth, minHeight, hitSlop } = metrics;
    const hit = extractHitSlopPadding(hitSlop);
    const effectiveWidth = (width ?? minWidth ?? 0) + hit.horiz;
    const effectiveHeight = (height ?? minHeight ?? 0) + hit.vert;
    const passes = effectiveWidth >= MIN_TOUCH_TARGET && effectiveHeight >= MIN_TOUCH_TARGET;
    if (!passes) {
        // eslint-disable-next-line no-console
        console.warn(
            `[touchTargetAudit] ${name} below recommended size: ${effectiveWidth}x${effectiveHeight} (<${MIN_TOUCH_TARGET}). Add padding or hitSlop.`
        );
    }
    return passes;
}
