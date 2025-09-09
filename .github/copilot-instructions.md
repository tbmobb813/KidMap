Summary

This PR adds a single repository-level onboarding document for AI coding agents at .github/copilot-instructions.md. The goal is to reduce failed builds/tests, minimize bash command issues, and speed up task completion by giving the agent a reliable “map” of the project: how it’s structured, how to bootstrap/build/run/test/lint/type-check, and what order to run things in.

Why

Fewer PR rejections due to CI/test failures or environment missteps

Less trial-and-error with grep/find and repeated codebase exploration

More consistent adherence to project conventions and CI expectations

What changed

## Copilot agent onboarding — KidMap (concise)

This file is the quick-start guide for automated coding agents working on KidMap. Keep it short — follow these steps exactly and only search the repo when a required config or script is missing.

Checklist for this task
- Install deps locally: `npm install` (CI uses `npm ci`)
- Run lint → typecheck → tests before committing
- Respect path aliases (`@/`) and jest mappings
- Avoid adding native dependencies to the managed Expo app

1) What this repo is
- Expo + React Native app written in TypeScript. Entry and routing live in `app/` (Expo Router).
- UI lives in `components/`; screens under `app/` and `app/(tabs)/`.
- State is under `stores/`; hooks in `hooks/`; theme tokens in `constants/`.
- Tests live in `_tests_/` (note: repo contains a recent test reorganization; duplicates preserved under `_tests_/duplicates/`).

2) Essential commands (run in this exact order for CI parity)
- npm install
- npm run lint
- npm run typecheck    # tsc --noEmit or configured script
- npm test             # jest (uses jest-expo preset)

Run locally for development
- npx expo start
- npm run android / npm run ios (or use `npx expo run:android` / `npx expo run:ios`)

3) Tests and Jest notes
- Jest config: `jest.config.js` (uses `jest-expo` preset). If you add path aliases, update `moduleNameMapper` to match `tsconfig.json` paths.
- Unit/UI tests live under `_tests_/`. The repo uses a conservative dedupe: originals may be in `_tests_/duplicates/{mergeable,discardable}` — do not delete those without human review.
- Common helper: `_tests_/testUtils.tsx` provides `render`, `createTestWrapper`, theme provider wiring, and mocks. If you move or rename it, update imports.

4) Project-specific conventions
- Path alias `@/` is used for source imports (e.g., `@/components/RouteCard`). Keep `tsconfig.json` and Jest mapping in sync.
- Theme tokens live under `constants/theme` — prefer tokens over hard-coded colors.
- React Query is used (`@tanstack/react-query`); tests often create a `QueryClient` with retry disabled.
- Tests use `@testing-library/react-native` and may mock native modules and icon libs (see `lucide-react-native` mocks in tests).

5) Scripts & automation to look for
- `scripts/` contains test analysis and dedupe helpers used during the recent reorg (indexing, dedupe-plan, relocate). These are non-critical but useful for test maintenance.

6) Common failure modes & quick fixes
- Import-order / ESLint issues: follow repo lint rules. Run `npm run lint` and fix ordering.
- Type errors due to duplicate declarations: search for duplicate helper files (e.g., multiple `testUtils`) or mismatched `.d.ts` inclusions in `tsconfig.json`.
- Jest failures caused by path aliasing: update `jest.config.js` moduleNameMapper to mirror `tsconfig.json > compilerOptions.paths`.
- Expo/Metro stale cache: `npx expo start -c`.

7) PR & CI etiquette for agents
- Keep changes small and focused.
- Always run lint → typecheck → test and attach failing output if you open a draft PR.
- Non-destructive edits preferred for bulk reorganizations (preserve originals under `_tests_/duplicates/`).

If anything in this doc is missing or a script name differs in `package.json`, tell me which file to inspect and I'll adapt the instructions. Ready to iterate on details you want added.