# Architecture Overview

This document summarizes current app structure after Sprint 1 stabilization.

## Core Domains
- Navigation & Routing: Expo Router with typed helper (`nav`) ensuring parameter safety.
- Validation Layer: Zod schemas in `src/core/validation` used for safety zones, categories, photo check-ins.
- Safety Monitoring: `useSafeZoneMonitor` hook producing status + capped event history; feature error boundary isolates issues.
- State Management: Zustand stores (`navigationStore`, `regionStore`, `categoryStore`, etc.) kept lean; actions perform validation before mutating state.
- UI Feedback: Toast system replaces non-critical Alerts; ErrorBoundaries catch render errors; invariant utility logs dev-only warnings.

## Data Flow (Example: Routes)
1. UI triggers travel mode / destination selection.
2. `navigationStore.findRoutes()` generates or (future) fetches route candidates.
3. Components (`MapScreen`, `RouteDetailScreen`) derive selected route + steps with null-safe guards.
4. Directional components render defensively (fall-backs for missing data).

Future (Sprint: Performance & Data): Introduce react-query to wrap remote route fetch; `findRoutes` becomes query invalidation trigger.

## Nullability & Safety Patterns
- Early returns with placeholder UI (`RouteDetailScreen`, `RouteCard`, `DirectionStep`).
- Strict optional chaining avoided inside tight loops; values normalized first.
- `invariant()` for non-fatal dev assertions.

## Accessibility Enhancements
- Interactive components marked with `accessibilityRole`, `accessibilityLabel`, and state.
- Hit slop added for touch targets; future pass will address dynamic announcements and contrast checks.

## Testing Strategy
- Behavior-oriented tests for safety monitor, deep linking, and route detail.
- Defensive rendering tests for nullability (RouteCard, DirectionStep).
- Accessibility labels presence test to guard regressions.
- Future: add react-query cache test, performance measurement harness.

## Error Handling
- Global `ErrorBoundary` plus `FeatureErrorBoundary` for safety module.
- Toast surfaces non-blocking issues; alerts reserved for destructive actions or permissions.

## Performance Considerations
- Memoization on frequently re-rendered items (RouteCard, CategoryButton).
- Stable callback refs via `useCallback` in `MapScreen`.
- Future: Virtualization (FlatList), react-query caching, perf marks.

## Next Sprint Entry Points
1. Integrate react-query provider at root.
2. Refactor `findRoutes` to async route service (mock now, API later).
3. Add list virtualization for routes & favorites.
4. Add focus/announce utilities for toasts & route selection.

---
Generated initial version; expand as new modules evolve.
