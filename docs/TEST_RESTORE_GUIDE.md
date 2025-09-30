# Test restoration and stabilization guide

## Purpose

This document captures the pragmatic steps and small patterns we used to restore and stabilize the `AIJourneyCompanion` tests in this repo. Use it as a checklist when repairing corrupted or flaky tests and to keep new tests reliable.

## Quick contract

- Inputs: a failing or corrupted test file and the component(s) under test.
- Output: a small, focused test file that passes locally and integrates with CI.
- Error modes: async race conditions, React "not wrapped in act(...)" warnings, fetch/telemetry cross-test interference, Animated lifecycle issues.

## High-level steps (summary)

1. Inspect the failing test file and the component under test. Identify async code paths (fetch, timers, animations).
2. Centralize shared mocks (telemetry, Animated, default fetch) in `jest.setup.js` or a shared test helper. Export small accessors from `_tests_/testUtils.tsx` so tests can use the mocks without duplicating setup.
3. Replace ad-hoc `global.fetch` references in tests with a `getFetch()` helper that uses the shared fetch mock. Provide per-test responses with `mockResolvedValueOnce` and queue responses just before actions that trigger them.
4. Prefer testing-library async queries (`findByText`, `findAllByText`, `waitFor`) when UI updates are driven by async work.
5. If the component schedules state updates (`setTimeout`, Animated callbacks), either:
   - wrap timer advances in tests with `act(async () => { jest.advanceTimersByTime(...); await Promise.resolve(); })`, or
   - make a minimal, deliberate change to the component to defer immediate state updates (for example `setTimeout(..., 0)`) so tests don't get noisy act warnings. Note tradeoffs: deferring logic may change microtask ordering.
6. Use fake timers only where necessary; always restore real timers in `finally` blocks (`jest.useRealTimers()`).
7. Keep telemetry assertions deterministic by using a shared jest mock (e.g. `global.__mockTrack`) and clearing it in `beforeEach`.
8. For animation lifecycle tests, centralize Animated mocks in `jest.setup.js` so assertions like `expect(Animated.Value).toHaveBeenCalled()` are stable.
9. Run focused tests, fix small issues, then run lint → typecheck → tests before committing.

## Common failure modes and fixes

- React 'not wrapped in act(...)' warnings: caused by state updates scheduled outside the test's `act` scope (timeouts, microtasks). Fix by wrapping test timer advances in `act(...)` or by deferring state updates in the component (small `setTimeout(..., 0)`).
- Initial-mount fetch consuming the mock intended for a button press: queue `mockResolvedValueOnce` immediately before the user interaction that triggers the fetch.
- Tests that find multiple matches for a text (preview + expanded): use `findAllByText` and assert length or scope the queries to specific nodes.
- TypeScript complaints about using ad-hoc fetch mocks: add a small helper that returns an object implementing `json: () => Promise<...>` or cast to `any` for focused tests. Consider a typed helper later.

## Useful commands (local dev)

Run lint → typecheck → tests (CI-parity order):

```bash
npm install
npm run lint
npm run typecheck
npm test
```

Run a single test file while iterating (fast feedback):

```bash
npx jest _tests_/core/AIJourneyCompanion.minimal.test.tsx --runInBand --detectOpenHandles --silent=false
```

## Quick debugging checklist after a failing run

1. Read the Jest output and console.error warnings. Look for "not wrapped in act(...)", network errors, or uncaught exceptions.
2. If you see `act(...)` warnings: search for `setTimeout` / timing code in the component; either wrap test timer advances in `act(...)` or defer state updates in the component until the test can see them.
3. Confirm fetch mocks were queued in the test and haven't been consumed unexpectedly. If needed, move the `mockResolvedValueOnce` so it is queued immediately before the triggering action.
4. Use `findByText`/`findAllByText` or `waitFor` to wait for UI updates that depend on async work.
5. Use `beforeEach` to clear shared mocks such as telemetry: `getGlobalMockTrack()?.mockClear()`.

## Next improvements (optional)

- Add a tiny typed `createMockFetchResponse(text: string)` helper to avoid casting to `any` in tests.
- Provide a `/_tests_/sharedMocks.ts` that re-exports `getGlobalMockTrack()` and other helpers so imports are consistent across tests.
- Consider adding a small linter rule or Jest check to avoid unscoped global fetch calls in tests.

## Notes

- This guide documents a low-risk, repeatable approach used to restore the AIJourneyCompanion tests. It favors small, reversible changes to component code (deferring state updates) and consolidating mocks to avoid cross-test interference.
- If you prefer not to edit components to avoid `act` warnings, fully wrap any test-driven timing behavior in `act(...)` and use fake timers carefully.

If you'd like, I can:

- tidy `jest.setup.js` lint warnings (unused catch variables, referencing `setTimeout`),
- export a `/_tests_/sharedMocks.ts` re-exporting the helpers for easier imports, or
- add `createMockFetchResponse()` to `_tests_/testUtils.tsx` and update tests to use it.

---
Last updated: 2025-09-26
