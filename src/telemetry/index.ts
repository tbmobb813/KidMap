// Minimal telemetry client abstraction.
// Allows pluggable adapters (console by default) and lightweight event typing.

// Central union of all telemetry events emitted by the app.
// Keep each shape minimal & flat for cheap serialization.
export type TelemetryEvent =
    | { type: 'screen_view'; screen: string; ts: number }
    | { type: 'accessibility_toggle'; setting: string; value: boolean; ts: number }
    | { type: 'route_fetch'; mode?: string; durationMs?: number; cacheHit?: boolean; ts: number }
    | { type: 'route_prefetch_start'; mode?: string; ts: number }
    | { type: 'route_prefetch_complete'; mode?: string; durationMs?: number; ts: number }
    | { type: 'safe_zone_entry'; zoneId?: string; zoneName?: string; ts: number }
    | { type: 'safe_zone_exit'; zoneId?: string; zoneName?: string; ts: number }
    | { type: 'safety_monitor_toggled'; enabled?: boolean; ts: number }
    | { type: 'ai_companion_interaction'; action: 'quiz' | 'more' | 'story_generated'; destinationId?: string; destinationName?: string; ts: number };

export interface TelemetryAdapter {
    record: (e: TelemetryEvent) => void;
    flush?: () => Promise<void> | void;
}

class ConsoleAdapter implements TelemetryAdapter {
    record(e: TelemetryEvent) { if (process.env.NODE_ENV !== 'test') console.log('[telemetry]', e); }
    flush() { /* noop */ }
}

class MemoryAdapter implements TelemetryAdapter {
    events: TelemetryEvent[] = [];
    record(e: TelemetryEvent) { this.events.push(e); }
    flush() { /* noop */ }
}

let adapter: TelemetryAdapter = new ConsoleAdapter();

export function setTelemetryAdapter(a: TelemetryAdapter) { adapter = a; }
export function getTelemetryAdapter() { return adapter; }

// Allow callers to omit some optional fields; runtime adapter just forwards.
export function track<E extends Omit<TelemetryEvent, 'ts'>>(e: E) {
    adapter.record({ ...(e as any), ts: Date.now() });
}

// Helper for timing operations without coupling to performance marks directly.
export async function time<T>(label: string, fn: () => Promise<T>, details?: Record<string, any>): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const durationMs = Date.now() - start;
    if (label === 'route_fetch') {
        track({ type: 'route_fetch', mode: String(details?.mode), durationMs, cacheHit: Boolean(details?.cacheHit) });
    }
    return result;
}

export { MemoryAdapter };

// Test helpers (safe no-ops if a different adapter is in use)
export function getMemoryEvents(): TelemetryEvent[] {
    return adapter instanceof MemoryAdapter ? [...(adapter as MemoryAdapter).events] : [];
}
export function resetMemoryEvents(): void {
    if (adapter instanceof MemoryAdapter) (adapter as MemoryAdapter).events = [];
}
