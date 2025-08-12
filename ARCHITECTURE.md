# Architecture Overview

This document summarizes current app structure after Sprint 1 stabilization and early Sprint 2 (data & performance) enhancements.

## Core Domains

- Navigation & Routing: Expo Router with typed helper (`nav`) ensuring parameter safety.
- Validation Layer: Zod schemas in `src/core/validation` used for safety zones, categories, photo check-ins.
- Safety Monitoring: `useSafeZoneMonitor` hook producing status + capped event history; feature error boundary isolates issues.
- State Management: Zustand stores (`navigationStore`, `regionStore`, `categoryStore`, etc.) kept lean; actions perform validation before mutating state.
- UI Feedback: Toast system replaces non-critical Alerts; ErrorBoundaries catch render errors; invariant utility logs dev-only warnings.

## Data Flow (Routes After S2-3)

1. UI sets origin/destination & travel mode in navigation store.
2. `useRoutesQuery` (react-query) fetches/caches transformed route list via `routeService` (mock async layer).
3. Store holds only `selectedRoute` (list no longer stored); components consume query output directly.
4. `RouteDetailScreen` resolves route from cached query data or selected route id.
5. Defensive rendering continues to guard null/empty states.

Caching Behavior: Identical query keys reuse cache (validated by tests). Metrics (fetchCount) exposed for dev/test to verify cache hit rates; imperative `findRoutes` removed in favor of declarative data hook.

### Data Fetch Lifecycle (Routes)

1. User sets origin/destination (and optionally travel preferences) in navigation store.
2. `useRoutesQuery` composes a composite key:
	`[ 'routes', originId, destinationId, mode, travelMode, avoidHighways, avoidTolls, accessibilityMode ]`.
3. React Query lookup:
	- Cache hit (fresh): data returned synchronously, `routes_cache_hit:<key>` mark recorded.
	- Cache miss/stale: service call executed; upon completion `routes_cache_miss:<key>` mark recorded.
4. Service (`fetchRoutes`) simulates latency, transforms base sample routes per travel mode, increments a module-scoped `fetchCount` metric.
5. Hook instrumentation marks start/end + measures duration: `routes_fetch_start:<key>`, `routes_fetch_end:<key>`, `routes_fetch_duration:<key>`.
6. Map screen effect records first paint: `routes_first_paint:<key>` and measure `routes_time_to_first_paint:<key>` (from initial fetch start).
7. Components consume query result directly; only `selectedRoute` id persists in store to avoid stale duplication.

### Cache Strategy & Invalidation

- Composite key isolates distinct parameter sets (prevents accidental data bleed across modes/preferences).
- `staleTime` keeps recent fetches warm for rapid back-to-back navigations.
- Dev/test metric `fetchCount` validates that UI transitions reuse cached data (see `routesCacheMetrics.test`).
- Future invalidation triggers: region change, user preference changes (e.g., accessibility profile) not yet wired—will call React Query's `invalidateQueries` with matching partial key.

### Error Paths (Planned)

- Present mock service is deterministic; future network integration will surface errors through React Query's error state + dedicated boundary inside route results panel.
- Performance marks will eventually include failed fetch durations (kept identical API; measure recorded even on error for visibility).

## Nullability & Safety Patterns

- Early returns with placeholder UI (`RouteDetailScreen`, `RouteCard`, `DirectionStep`).
- Strict optional chaining avoided inside tight loops; values normalized first.
- `invariant()` for non-fatal dev assertions.

## Accessibility Enhancements

- Interactive components marked with `accessibilityRole`, `accessibilityLabel`, and state.
- Hit slop added for touch targets.
- Toasts announce themselves to screen readers (role="alert" + announcement utility) and attempt to shift focus.
- Dev touch target audit utility warns for elements under 48x48 effective size (considering hitSlop); core buttons updated.
- Foundation laid for future live region announcements & contrast / dark mode enhancements.

### Accessibility Utilities

| Utility | Purpose | Notes |
|---------|---------|-------|
| `announce(message)` | Cross-platform announcement (native AccessibilityInfo or console fallback in tests/web) | Swallows errors, async |
| `announceForAccessibility` | Legacy direct native wrapper | To be consolidated; kept for backwards compatibility |
| `isScreenReaderEnabled()` | Detect if a screen reader is active (native only) | Returns false on web |
| `getAccessibilityLabel(text, context?)` | Compose richer label with optional context | Simple join; future i18n |
| `getAccessibilityHint(action)` | Standard action hint phrase | Future i18n/localization |
| `auditTouchTarget(metrics)` | Dev-only touch target sizing audit (>=48) | Considers hitSlop extension |

Planned improvements: unify announce helpers, add DOM `aria-live` region for web builds, dynamic contrast theme tokens.

#### Announce API v2 (In Progress - S3-4)

Unified `announce(message, { politeness, dedupe })` introduced:

- Native: delegates to AccessibilityInfo.announceForAccessibility.
- Web: hidden live regions (`polite` & `assertive`) auto-created once.
- Dedupe: suppresses identical messages inside 600ms window to reduce verbosity.
- Legacy `announceForAccessibility` now deprecated wrapper (assertive default) with dev warning; slated removal S3-T1.

Future additions: queue management & cancellation handles for long-running voice navigation (ties into S3-3).

## Testing Strategy

- Behavior-oriented tests for safety monitor, deep linking, and route detail.
- Defensive rendering tests for nullability (RouteCard, DirectionStep).
- Accessibility labels presence test to guard regressions.
- React-query cache test added (routes caching) and metrics test ensures no redundant fetches.
- Performance marks test validates mark/measure lifecycle and no-op behavior boundaries (dev/test only).

## Error Handling

- Global `ErrorBoundary` plus `FeatureErrorBoundary` for safety module.
- Toast surfaces non-blocking issues; alerts reserved for destructive actions or permissions.

## Performance Considerations

- Memoization on frequently re-rendered items (RouteCard, CategoryButton).
- Stable callback refs via `useCallback` in `MapScreen`.
- Virtualized lists: Routes (Map screen) & Favorites (Home screen) now use FlatList with windowing.
- React-query caching eliminates redundant route fetches.
- Performance marks utility captures route fetch durations & time-to-first-route paint (dev/test only). Potential getItemLayout optimization remains pending.

### Performance Instrumentation

| Mark / Measure | Description | Trigger |
|-----------------|-------------|---------|
| `routes_fetch_start:<key>` | Start timestamp of route service call | Before `fetchRoutes` executes |
| `routes_fetch_end:<key>` | End timestamp of service call | After promise resolves |
| `routes_fetch_duration:<key>` | Duration derived from start/end | Immediately after end mark |
| `routes_cache_hit:<key>` | Indicates data served from cache | When no new fetch increment detected |
| `routes_cache_miss:<key>` | Indicates network/service fetch executed | After fetchCount increment |
| `routes_first_paint:<key>` | First successful UI paint with data | Map screen effect (once per key) |
| `routes_time_to_first_paint:<key>` | Fetch start -> first paint duration | After first paint mark |

All instrumentation is gated (no-op in production) to avoid user-impacting overhead.

## Planned (Sprint 3)

Upcoming architectural additions:

| Area | Planned Addition | Notes |
|------|------------------|-------|
| Accessibility | Announce API v2 (single API + web live regions) | Dedupe legacy helper, politeness levels |
| Theming | Dark mode & high contrast tokens | Semantic token layer with contrast checks |
| Data Persistence | React Query cache persistence | AsyncStorage adapter + versioned schema key |
| Navigation UX | Voice navigation progressive announcements | Distance threshold scheduling & cancellation |
| Performance | Route prefetch heuristic | Constrained concurrency + metrics (prefetchStarted/Completed) |
| Telemetry | Error & invariant reporting bridge | Dev console sink, future remote target |

Each will extend existing documentation sections once implemented (annotated with versioned headings after merge).

---
Generated initial version; expand as new modules evolve.
