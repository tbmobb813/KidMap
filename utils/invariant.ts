// Lightweight invariant utility (dev-only warnings)
export function invariant(condition: any, message: string) {
    if (!condition && typeof __DEV__ !== 'undefined' && __DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[invariant] ${message}`);
    }
}
