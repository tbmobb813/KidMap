# Test reorganization and quick wins

This document lists recommended changes to the test layout, priorities for adding tests, and a small plan to raise coverage while keeping tests fast and stable.

1. Quick housekeeping

- Add a repository-level mock for `expo-constants` to silence native warnings in Jest tests.
- Prefer `_tests_/testUtils.tsx` `customRender` / `AllTheProviders` for components that need theme/query/toast providers.
- Reuse existing `__mocks__` JS mocks instead of adding new test dependencies.

2. Triage slow / large tests

- Split very large component test files into focused units (rendering, interactions, integration).
- Move integration or long-running tests into `critical/` or a separate jest config.

3. Quick coverage targets (first wave)

- Pure utils: `utils/error/errorHandling.ts`, `utils/config/config.ts`, `utils/accessibility/accessibility.ts`
- Stores: add smoke tests using `__mocks__/stores` (parentalStore, categoryStore, regionStore)
- Hooks: harness components for `useRoutesQuery` and `useNetworkStatus`

4. Naming & structure

- Use `.unit.test.ts` for pure function tests and `.test.tsx` for React components, matching the naming conventions already used in `_tests_/core/` and elsewhere in the repo (e.g., `_tests_/core/hooks_useAsyncStorage.unit.test.ts` for hooks, `_tests_/core/components_SmartRouteSuggestions.test.tsx` for components).
- Keep one authoritative test per component and avoid duplicates in `_tests_/duplicates/` unless actively maintained.
  - Example: If you need to maintain a duplicate test (e.g., for migration or refactoring), add a comment at the top of the duplicate file such as `// actively maintained duplicate - do not delete` and document its purpose in the test file.

5. Coverage gating strategy

- Baseline current coverage and enforce regression-only rule in CI. Gradually raise per-folder thresholds: utils 50%, components 50%, hooks 30%, stores 30%.
- Configure per-folder coverage thresholds in CI using the `coverageThreshold` option in `jest.config.js` (see the repo's Jest config for examples).
- Baseline current coverage and enforce regression-only rule in CI. Gradually raise per-folder thresholds: utils 50%, components 50%, hooks 30%, stores 30%.

6. Next steps implemented in this change

- Add `__mocks__/expo-constants.js` to silence warnings.
- Add five small tests to `_tests_/core/` to lift coverage and provide examples for future tests.

7. Triage & prioritized test plan (added)

- Immediate triage (highest ROI):
  - hooks: `hooks/useAuth.ts`, `hooks/useAsyncStorage.ts` — central logic used widely by components and stores; unit tests here yield broad coverage benefits and are relatively low-risk.
  - stores: `stores/parentalStore.ts`, `stores/navigationStore.ts`, `stores/categoryStore.ts` — exercise load/save flows and most public APIs by mocking `AsyncStorage` and persistence helpers before requiring the modules.
  - components (logic-first): `components/SmartRouteSuggestions.tsx`, `components/SearchWithSuggestions.tsx` — test generated suggestion logic and press handlers without heavy rendering (mock theme/icons/debounce).

- Global test rules to follow when implementing these:

 1. Always mock `@react-native-async-storage/async-storage` (or `SafeAsyncStorage`) before importing modules that read storage on initialization. Use `jest.resetModules()`/`jest.doMock()` where appropriate.
 2. Avoid adding new test-only dependencies where possible; reuse `__mocks__` and `_tests_/testUtils.tsx` utilities.
 3. Prefer unit tests (hook or function-level) for logic-heavy files; use small harness components if a hook needs to be exercised.
 4. For timers (debounce, intervals), use `jest.useFakeTimers()` and advance timers deterministically.

Always mock @react-native-async-storage/async-storage before requiring modules that read it (use jest.resetModules() + jest.doMock('...AsyncStorage', ...) or a manual __mocks__ file). Otherwise the modules will read real storage during import and reduce determinism and coverage counting.
For modules that auto-initialize singletons or subscribe on import (e.g., authManager), mock the dependency that triggers initialization before importing the module under test (same jest.resetModules + doMock pattern).
Prefer unit tests (no heavy rendering) where possible. When a component uses theme/hooks or icons, mock useTheme, useDebounce, and icon components to keep tests fast.
Use small harness components (or test helpers in testUtils.tsx) to exercise hooks when you don't want to add a new test dependency like react-hooks testing library.

1) useAuth.ts — priority 1
Why high ROI: central auth state used across app; covering this hits code paths in many consumers.

Complexity & side effects

Subscribes to authManager and sets state on updates.
Exposes many action wrappers (login/register/logout/updateProfile/etc.) that just call authManager methods.
Uses a 1s initialization setTimeout (affects tests).
What to mock

Mock @/utils/auth to provide a controlled authManager object:
authState (initial)
addListener() returns an unsubscribe function and allows calling listener to simulate updates
stubs for login, register, logout, updateProfile, changePassword, resetPassword, verifyParentalPin, setParentalPin, extendSession, getSessionTimeRemaining, toggleLikedSuggestion, saveRoute
Mock @/utils/error/logger if noisy (or assert logs).
Test types and examples (unit, no heavy rendering)

1–2 initialization tests:
Case A: when authManager.authState is authenticated initially, useAuth() returns isAuthenticated=true, user and isInitialized becomes true (simulate fast by advancing timers or by mocking setTimeout).
Case B: simulate authManager.addListener and call the listener to update state: verify the hook updates state and isInitialized flips.
3–4 action wrapper tests:
login calls authManager.login and sets error on failure path.
logout calls authManager.logout and does not throw when authManager.logout rejects (it was catching errors).
updateProfile forwards args to authManager.updateProfile and returns its result.
verifyParentalPin forwards and returns boolean.
1 test for computed values:
canAccessFeature respects user.parentalControls (true/false) and returns expected boolean.
Edge cases

addListener called twice or unsubscribe invoked
timer-based initialization: use jest.useFakeTimers() and advance timers or mock the timeout by injecting/overriding setTimeout (but simpler: call the listener to set isInitialized rather than wait 1000ms)
Estimated tests & effort

~6 tests; 45–90 minutes to write + run.
Notes

Must jest.resetModules() and jest.doMock('@/utils/auth', ...) before importing useAuth.
Use small React harness components using the repo's test utils / render to mount provider/hook.
2) useAsyncStorage.ts — priority 1
Why high ROI: small, pure-ish hook used widely; testing will cover a common utility and increase hook coverage.

Complexity & side effects

Reads AsyncStorage.getItem in effect.
Exposes asynchronous setters/removers and refresh.
What to mock

@react-native-async-storage/async-storage with jest functions for getItem/setItem/removeItem.
For success and failure cases: mock getItem to return JSON string or throw.
Test types and examples

Initialization tests:
When AsyncStorage returns stored JSON → hook data equals parsed object, loading eventually false, error null.
When AsyncStorage throws → data equals defaultValue if provided, error set.
Mutations:
setData stores JSON (assert AsyncStorage.setItem called and hook data updated).
removeData removes key and data becomes null.
refresh calls loadData again: change mock return mid-test and call refresh to verify update.
How to run the hook

Create small test components that call the hook and expose results via test-rendered output or refs (pattern used elsewhere in repo). Use render from repo testUtils or @testing-library/react-native.
Edge cases

Non-JSON stored strings (should parse error): depending on implementation, parse will throw and be caught → error set.
setData throws → test that error is set and rethrown by setData.
Estimated tests & effort

~4 tests; 30–60 minutes.
3) parentalStore.ts — priority 2
Why ROI: store has many methods (safe zones, check-ins, settings). Covering save/load paths and a few actions brings coverage quickly (and many branches).

Complexity & side effects

On import/use, useEffect reads many AsyncStorage keys (Promise.all).
Methods read/write AsyncStorage and use Date.now()/Math.random to create ids.
What to mock

@react-native-async-storage/async-storage (read/write).
Optionally freeze Date.now and Math.random to check generated ids deterministically.
Test types and examples

Load from storage:
Mock AsyncStorage.getItem to return serialized values; require the store (with mocks in place) and assert state reflects parsed values and isLoading becomes false.
Save functions:
Call saveSettings, assert setItem called with STORAGE_KEYS.SETTINGS and stored payload includes new settings.
Authenticate parent mode:
Case when requirePinForParentMode=false → authenticateParentMode returns true and sets isParentMode.
Case wrong pin returns false.
SafeZone management:
addSafeZone returns new SafeZone with an id and persisted list updated (assert setItem called).
Check-in flow:
requestCheckIn creates an entry and saveCheckInRequests called.
Edge cases

AsyncStorage getItem rejects → store catches and sets isLoading=false (test ensure no unhandled rejection).
Failure in save functions logs error — assert no throw.
Estimated tests & effort

~6 tests covering load/save/auth/add/delete flows; 1–2 hours.
Notes

Must mock AsyncStorage before importing module to ensure the effect picks up the mocked getItem responses.
4) navigationStore.ts — priority 2
Why ROI: it's a large file with many actions (persist logic, findRoutes, add favorites). Tests here will hit many branches quickly.

Complexity & side effects

Uses zustand store (returned hook has .getState()/.setState()).
Calls fetchRoutes, loadPersistedState, savePersistedState (need to mock).
Uses schedulePersist debounce timer (use fake timers or mock savePersistedState and avoid waiting).
What to mock

@/services/routeService fetchRoutes to return predictable routes.
@/utils/persistence/persistence for loadPersistedState/savePersistedState.
Optionally verifyLocationProximity to control behavior of addLocationVerifiedPhotoCheckIn.
Test types and examples

Hydration:
Mock loadPersistedState to return persisted favorites etc., call hydrate() and assert state updated and isHydrated true.
Add/remove favorites:
Call addToFavorites with a place not in favorites and assert favorites changed and savePersistedState called eventually (mock debounce by faking timers or calling scheduled persistence directly).
findRoutesAsync:
With origin/destination unset → selectedRoute becomes null and routesLoading false.
With valid origin/destination → fetchRoutes returns array and selectedRoute set to first route.
addLocationVerifiedPhotoCheckIn:
Mock verifyLocationProximity to return in/out-of-radius; assert return object and photo checkins updated.
Edge cases

fetchRoutes throwing → selectedRoute null and routesLoading false.
Estimated tests & effort

~6–8 tests; 1.5–2 hours.
Notes

For schedulePersist debounce, either use jest.useFakeTimers() and advance timers or stub savePersistedState and assert it was scheduled (or call internal schedulePersist via getState and run timers).
5) categoryStore.ts — priority 2
Why ROI: many save/validation flows (create/update/delete/approve) and fallback useCategoryStore branch — covering this gives good coverage.

Complexity & side effects

AsyncStorage usage on init.
Zod validation schemas for add/update (throwing on invalid input).
Methods that persist.
What to mock

@react-native-async-storage/async-storage.
Zod validators are local; tests should exercise both success & failure.
Test types and examples

Load categories from storage (mock getItem).
addCategory success: call addCategory with valid payload, assert saved and returned new category id and that AsyncStorage.setItem was called.
addCategory invalid: call with malformed data to expect an error thrown.
deleteCategory: ensure only non-default deletions persist.
getApprovedCategories/getPendingCategories behavior.
Edge cases

saveCategories failing (simulate setItem throw) — should catch and not throw from addCategory (but current code awaits saveCategories, so may throw); verify behavior.
Estimated tests & effort

~5 tests; 1–1.5 hours.
6) SmartRouteSuggestions.tsx — priority 3 (component)
Why ROI: component has pure suggestion-generation logic plus visual rendering; testing logic gives moderate coverage.

Complexity & side effects

Internal function generateSmartSuggestions is not exported; suggestions are generated inside component on useEffect.
Uses new Date().getHours() inside simulateCrowdLevel and has an interval (timers).
Uses theme. Renders icons from lucide-react-native.
What to mock / test approach

Mock useTheme to return simple theme object so rendering doesn't require full provider.
Mock lucide icon components to simple placeholders (or rely on existing mocks in __mocks__).
Fake timers: jest.useFakeTimers() and set a specific hour by mocking Date.now or overriding Date.prototype.getHours.
Tests:
Render the component with props (destination/timeOfDay/weather) and assert that ScrollView contains expected suggestion titles as text (e.g., when weather='rainy' expect 'Covered Route' present).
Check that pressing a suggestion calls onSelectRoute with the suggestion object (mock function).
If extracting `generateSmartSuggestions` would be preferred for easier unit tests, suggest adding an exported helper (small code change); note that this is a repo change that affects the component API and should be reviewed and agreed upon by the team before implementation.
Estimated tests & effort
Estimated tests & effort

~3 tests; 45–90 minutes.
Notes

Prefer shallow render with @testing-library/react-native and the repo test wrapper.
7) SearchWithSuggestions.tsx — priority 3 (component)
Why ROI: small and easy to test; exercising debounced show/hide and FlatList rendering yields useful coverage.

Complexity & side effects

Uses useDebounce hook and useTheme; renders SearchBar (child component).
showSuggestions toggles based on debounced value and suggestions length.
What to mock / test approach

Mock useDebounce to return the immediate value (simple jest.mock to the hook import).
Mock useTheme to return simple theme.
Use render to mount component and supply value, suggestions, and onSelectSuggestion mock.
Tests:
When value is non-empty and suggestions provided, FlatList renders items (assert by searching for suggestion text).
Pressing a suggestion calls onSelectSuggestion with correct item.
Clearing (simulate onClear) hides suggestions (call prop or send onChangeText('') then assert suggestions not present).
No need to render SearchBar internals — you can mock it as a simple component either by placing a mock in `__mocks__/SearchBar.js` or by defining the mock inline within the test file for test isolation.
Estimated tests & effort

~3 tests; 30–60 minutes.
Prioritized implementation plan (next actions)
Short-term plan to maximize coverage quickly (first 2–3 days of focused work):

Batch A (Immediate, high ROI) — implement now if you want me to:

Write tests for:
useAsyncStorage.ts — 4 tests (init success, init failure, setData, removeData).
useAuth.ts — 6 tests (initialization/listener, login failure path, logout error handling, updateProfile forwarding, canAccessFeature, verifyParentalPin).
Rationale: these two hit central logic used widely; they’re relatively small and avoid heavy rendering. Expect coverage gain for hooks area quickly.

Batch B (next, moderate ROI):

parentalStore.ts — 6 tests (load, saveSettings, addSafeZone, authenticateParentMode true/false, requestCheckIn).
navigationStore.ts — 6 tests (hydrate, addToFavorites, findRoutesAsync success/fail, addLocationVerifiedPhotoCheckIn).
categoryStore.ts — 5 tests (load, addCategory success, addCategory invalid throws, deleteCategory, getApprovedCategories).

Batch C (component logic)

SmartRouteSuggestions.tsx and SearchWithSuggestions.tsx — 3 each.
Total estimated: ~33 tests across batches A–C. Implementation time estimate: 6–10 hours total (split across batches); Batch A ~1.5–2 hours including test + run + small fixes.

Quality gates I’ll follow when implementing (must follow for deterministic tests):

- You must mock AsyncStorage, auth, and API dependencies before requiring modules in your tests. See `_tests_/core/hooks_useAsyncStorage.unit.test.ts` for a sample setup.

Always mock AsyncStorage / auth / api before requiring modules.
Run core tests (jest.config.core) after each batch.
Fix any TypeScript typing hiccups in tests (use jest.fn() as any if necessary).
Keep tests deterministic (use fake timers or avoid relying on actual timers).

Batch A (immediate implementation)

- Goal: quickly raise coverage by adding focused, deterministic unit tests for critical hooks.
- Files to add now:
  - `_tests_/core/hooks_useAsyncStorage.unit.test.ts` — tests for initialization (success + failure), `setData`, `removeData`, and `refresh`.
  - `_tests_/core/hooks_useAuth.unit.test.ts` — tests for initialization/listener wiring, action forwarding (login failure path, logout error handling), and computed utilities (`canAccessFeature`).

Each test file will:

- Mock AsyncStorage and auth manager dependencies before importing the hook.
- Use small harness components and `@testing-library/react-native`'s `render` + `waitFor` (the repo already provides test utils) to exercise hooks.
- Keep tests deterministic by faking timers or stubbing `Date.now()` and `Math.random()` when needed.

If you'd like, I'll run the core suite with coverage after Batch A to show the delta and plan Batch B (stores) next.

---
If you want me to implement more tests or split existing long-running suites, tell me which components or stores to prioritize next.
