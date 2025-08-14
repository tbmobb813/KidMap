# Product Backlog / Ticket List

Format

| ID | Title | Priority | Effort (S/M/L) | Theme | Status |
|----|-------|----------|----------------|-------|--------|
|    | (Meta row placeholder) |  |  |  |  |

(Details follow each table in expandable sections.)

---

## Sprint 2 (Completed)

| ID | Title | Priority | Effort | Theme | Status |
|----|-------|----------|--------|-------|--------|
| S2-1 | Integrate React Query Provider | High | S | Performance & Data | Planned |
| S2-2 | Async Route Service Abstraction | High | M | Performance & Data | Planned |
| S2-3 | Refactor findRoutes to use Service + Caching | High | M | Performance & Data | Planned |
| S2-4 | Virtualize Route List (FlatList) | High | S | Performance & Data | Planned |
| S2-5 | Virtualize Favorites / Places List (FlatList) | Medium | S | Performance & Data | Planned |
| S2-6 | Accessibility: Toast Focus & Screen Reader Announcements | High | M | Accessibility | Done |
| S2-7 | Accessibility: Minimum Touch Target Audit (>=48) | Medium | S | Accessibility | Done |
| S2-8 | Add Performance Marks (TTFR, Route Gen Time) | Medium | S | Performance & Data | Done |
| S2-9 | Route Query Cache Reuse Test & Metrics | Medium | S | Performance & Data | Done |
| S2-10 | Architecture Doc Expansion (Data Layer + A11y) | Medium | S | Docs | Done |
| S2-11 | Pre-commit Hooks (lint+type+test changed) | High | S | Tooling | Done |
| S2-12 | CI Optimization (parallel jest, coverage threshold) | Medium | M | Tooling | Done |

### Ticket Details

#### S2-1 Integrate React Query Provider

Add QueryClient + provider in root layout, default retry=1, staleTime config placeholder.
Acceptance: Provider present; existing screens render unchanged; tests still pass.

#### S2-2 Async Route Service Abstraction

Create `services/routeService.ts` exposing `fetchRoutes(params): Promise<Route[]>` (mock delay + deterministic data).
Acceptance: Unit test covers resolution & shape; error path returns empty & logs warning.

#### S2-3 Refactor findRoutes

Replace inline generation with service call; add caching via react-query (`useQuery(['routes', originId, destId, mode, options])`).
Acceptance: Re-renders with same params uses cached data (tested by mock call count =1).

#### S2-4 Virtualize Route List

Replace map over routes with FlatList; keyExtractor route.id; memoized item renderer.
Acceptance: No performance regression; test ensures list renders correct count.

#### S2-5 Virtualize Favorites

Apply FlatList to favorites UI (if not yet); guard empty state.
Acceptance: Snapshot / item count test.

#### S2-6 Toast Focus Announcements

Add utility to shift accessibility focus + optional spoken message when toast appears.
Acceptance: Accessibility test: element with toast label accessible within timeframe.

#### S2-7 Touch Target Audit

Ensure interactive components min 48x48 or hitSlop extending area; document exceptions.
Acceptance: Automated check script (sizes inspected) or manual list in docs.

#### S2-8 Performance Marks

Utility to record `performance.now()` timestamps: route query start/end, first route paint.
Acceptance: Log entries visible in dev mode; simple test asserts mark function no-ops in prod env variable.

#### S2-9 Route Cache Test & Metrics

Add jest test verifying second hook call doesn’t refetch; optional metric aggregator counts fetches.
Acceptance: Expect mock fetch call count stable across re-renders.

#### S2-10 Architecture Doc Expansion

Add sections: Data Fetch Lifecycle, Cache Strategy, Accessibility Utilities.
Acceptance: PR diff shows added headings + content.

#### S2-11 Pre-commit Hooks

Add Husky + lint-staged: run eslint, typecheck (incremental), jest --bail on changed tests.
Acceptance: Commit blocked on failing lint/test.

#### S2-12 CI Optimization

Implement jest worker tuning, coverage thresholds (>=80% lines), optional node_modules caching scaffold.
Acceptance: Local `npm test -- --coverage` meets thresholds; config committed.

---

## Sprint 3 Candidate (Shortlist)

| ID | Title | Priority | Effort | Theme | Status |
|----|-------|----------|--------|-------|--------|
| S3-1 | Dark Mode & High Contrast Tokens | High | M | Accessibility | Complete |
| S3-2 | Offline Route Cache Persistence | High | M | Performance & Data | Planned |
| S3-3 | Voice Navigation Progressive Announcements | Medium | M | Accessibility | Planned |
| S3-4 | Accessibility Announce API Unification | High | S | Accessibility | Complete |
| S3-5 | Invariant / Error Telemetry Bridge | Medium | S | Tooling | Planned |
| S3-6 | Route Prefetch Heuristic (Predictive) | Medium | M | Performance & Data | Planned |
| S3-7 | Dependency & License Audit CI Step | Low | S | Tooling | Planned |
| S3-8 | Performance Budget Guard (Bundle Size) | Medium | S | Performance & Data | Planned |
| S3-9 | Safety Event Streaming Stub (WebSocket) | Medium | M | Safety | Planned |
| S3-T1 | Deprecate Legacy announceForAccessibility | Medium | XS | Accessibility | Complete |
| S3-T2 | Consolidate Test Utilities | Low | XS | Testing | Planned |
| S3-T3 | Jest Selective Suite Tagging | Low | S | Testing | Planned |

### Sprint 3 Ticket Details (Summary)

#### S3-1 Dark Mode & High Contrast Tokens ✅

**COMPLETED:** System theme detection with manual toggle controls, WCAG AA/AAA compliant semantic tokens, enhanced ThemeProvider with accessibility settings integration, contrast checking script (`npm run contrast:check`), comprehensive test coverage, and theme persistence hooks. Includes Auto/Light/Dark/High Contrast modes with reactive switching.

#### S3-2 Offline Route Cache Persistence

Persist React Query cache to AsyncStorage with versioning; rehydrate without refetch; tests for hydrate path & fetchCount stability.

#### S3-3 Voice Navigation Progressive Announcements

Announce next direction with distance thresholds; mute toggle; respects screen reader state.

#### S3-4 Accessibility Announce API Unification ✅

**COMPLETED:** Single `announce(message, { politeness, dedupe, queueable })` with web live region support, queue management for voice navigation, cancellation handles, and legacy wrapper deprecation. Full test coverage included.

#### S3-5 Invariant / Error Telemetry Bridge

`reportError(error, context)` pluggable sink; integrate in boundaries & service catches.

#### S3-6 Route Prefetch Heuristic

Prefetch likely alternate routes / modes post selection (limited concurrency + metrics).

#### S3-7 Dependency & License Audit CI Step

Classify & allowlist licenses; fail on disallowed types.

#### S3-8 Performance Budget Guard

Baseline size snapshot + fail build on >10% growth (warn first iteration).

#### S3-9 Safety Event Streaming Stub

Mock WebSocket emitting safety events with reconnect backoff.

#### S3-T1/T2/T3 Technical Debt

Cleanup and test utility consolidation plus suite tagging to reduce runtime.

## Backlog (Future Sprints)

| ID | Title | Priority | Effort | Theme | Status |
|----|-------|----------|--------|-------|--------|
| B-1 | High Contrast & Dark Mode Token Audit | Medium | M | Accessibility | Backlog |
| B-2 | Dynamic Voice Navigation Announcements (progress & ETA) | Medium | M | Accessibility | Backlog |
| B-3 | React Query Offline Persistence (AsyncStorage) | Medium | M | Performance & Data | Backlog |
| B-4 | Invariant Dev Overlay Panel | Low | M | Developer UX | Backlog |
| B-5 | Snapshot Tests for Core Cards | Low | S | Testing | Backlog |
| B-6 | Route Prefetch (Predictive) | Medium | L | Performance & Data | Backlog |
| B-7 | Gamification: Achievement Progress Engine | Medium | L | Engagement | Backlog |
| B-8 | Personalized Fun Facts (Region + Time-of-day) | Low | M | Engagement | Backlog |
| B-9 | Live Safety Event Streaming (WebSocket stub) | Medium | L | Safety | Backlog |
| B-10 | Parent Alert Escalation Workflow | High | L | Safety | Backlog |
| B-11 | Theming System Elevation (CSS variables / RN tokens) | Medium | M | Design System | Backlog |

---

## Icebox / Explore

| ID | Idea | Notes |
|----|------|-------|
| X-1 | Semantic Accessibility Mapping Layer | Abstract cross-platform roles -> internal map. |
| X-2 | Performance Flame Chart Recorder | Possibly integrate React Profiler API gating. |
| X-3 | Predictive Arrival ML Stub | Requires data collection + privacy review. |
| X-4 | Local Anomaly Detection for Safety Zones | Might leverage distance variance stats. |

---

## Label Legend

- Priority: High (user value / risk), Medium, Low
- Effort: S (<1 day), M (1–2 days), L (multi-day / cross-cutting)
- Theme: Performance & Data, Accessibility, Tooling, Docs, Testing, Safety, Engagement, Developer UX

## Dependencies & Ordering Notes

- S2-1 precedes S2-3 & S2-9.
- S2-2 precedes S2-3.
- S2-4 benefits from S2-3 (stable data source) but can proceed in parallel.
- Accessibility tasks independent of data layer changes.

## Definition of Ready (DoR)

A ticket is Ready when:

- Clear acceptance criteria
- No ambiguous external dependencies OR they’re documented
- Test strategy identified

## Definition of Done (DoD)

- Code + tests merged green
- Docs updated if public API/state shape changes
- No lint/type errors
- Added/updated test coverage for new logic

---
Initial backlog drafted for Sprint 2 planning.
