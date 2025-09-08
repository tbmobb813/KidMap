Summary

This PR adds a single repository-level onboarding document for AI coding agents at .github/copilot-instructions.md. The goal is to reduce failed builds/tests, minimize bash command issues, and speed up task completion by giving the agent a reliable “map” of the project: how it’s structured, how to bootstrap/build/run/test/lint/type-check, and what order to run things in.

Why

Fewer PR rejections due to CI/test failures or environment missteps

Less trial-and-error with grep/find and repeated codebase exploration

More consistent adherence to project conventions and CI expectations

What changed

Added: .github/copilot-instructions.md (agent onboarding guide)

Risk

Low (documentation only).

Validation

Document is self-contained and non task-specific (≤ 2 pages).

Describes the canonical command order and common pitfalls.

Uses project conventions typical of this repo (Expo/React Native + TypeScript, Jest, ESLint, etc.).

If any script names differ in package.json, we’ll adjust in a follow-up PR.

Checklist

Adds guidance for bootstrap/build/test/run/lint/typecheck in a fixed order

Notes common failure modes and mitigations

Highlights layout, configs, and CI checks to mirror locally

Explicitly instructs agents to trust the doc and only search when incomplete

File: .github/copilot-instructions.md

Copilot Coding Agent Onboarding
Read me first. Trust this document as the source of truth for how to work in this repo. Only perform broad code searches if the information here is incomplete or demonstrably incorrect.

1) High-Level Details
What this repository does
A mobile-first app built with Expo / React Native (TypeScript). It includes screens/components, state stores, utilities, and tests (Jest) for UI and logic. The project targets Android, iOS, and Web (Expo web).

Repo profile (at a glance)

Type: Monorepo-like single app (Expo RN)
Primary languages: TypeScript, JavaScript
Frameworks/tooling: Expo, React Native, Expo Router, TanStack Query, Jest (with jest-expo), ESLint + Prettier
Configs you’ll likely need: package.json, tsconfig.json, app.config.ts/app.json, jest.config.*, .eslintrc.*, .prettierrc*, possibly babel.config.js/ts
Typical structure:
app/ or src/ (screens, navigation)
components/ (reusable UI)
stores/ (Zustand/Context)
hooks/ (custom hooks)
constants/ (theme, colors, tokens)
utils/
_tests_/ (Jest tests)
.github/workflows/ (CI if configured)
If using path aliases like @/, ensure tsconfig.json has baseUrl/paths, and Jest’s moduleNameMapper matches.

2) Build & Validation Instructions (follow this exact order)
Environments (choose one and stick to it):

Node: Use the version declared in package.json > engines if present; otherwise prefer Node 20 LTS and npm 10.
Package manager: npm is canonical here (use npm ci on CI, npm install locally). Avoid mixing bun/pnpm unless scripts explicitly support them.
Expo CLI: Installed via node_modules (use npx expo ...).
Always start by installing deps: npm install (local) or npm ci (CI).

A. Bootstrap (first-time or after fresh clone)
npm install
(Optional) Copy envs if they exist: cp .env.example .env.local
Sanity check the project: npx expo-doctor (if available)
Common pitfalls & fixes

Metro cache issues → npx expo start -c
Path aliases not recognized in tests → ensure jest.config.* has moduleNameMapper for @/
TypeScript isolated module errors → run npm run typecheck to surface them
B. Lint → Typecheck → Test (fast feedback loop)
npm run lint
npm run typecheck (e.g., tsc --noEmit)
npm test (Jest; uses jest-expo preset for RN/Expo)
Always run lint → typecheck → test before pushing. Fix errors/warnings they surface.

C. Run (local dev)
Metro/Web UI: npx expo start
Web: press w or use --web
Android: npm run android (or npx expo run:android)
iOS (macOS): npm run ios (or npx expo run:ios)
Notes

On Windows + WSL: prefer running Metro on the same side as your emulator/device to avoid file watch issues. If using WSL, connect adb over TCP.
D. Production-style build (when needed)
Managed app build may use EAS; otherwise, platform runs:
Android: npx expo run:android then Gradle assembles
iOS: npx expo run:ios (requires Xcode/macOS)
If EAS is configured, refer to eas.json; otherwise default to run:platform flows above.

3) Project Layout & Where Things Live
Entry & routing: app/ (Expo Router) with stacks/layouts; screens are typically app/<route>.tsx.
Components: components/ for reusable UI.
State: stores/ (e.g., Zustand or Context providers).
Hooks: hooks/ for shared logic (e.g., useLocation, data fetching).
Theming: constants/ (e.g., tokens like theme.colors.surface, textSecondary). Prefer theme tokens over legacy color constants.
Utilities: utils/ (analytics, performance, formatters).
Tests: _tests_/ using Jest + jest-expo. UI tests co-located or under _tests_.
Configs:
TypeScript: tsconfig.json (check baseUrl, paths)
Jest: jest.config.js/ts (ensure preset: "jest-expo", moduleNameMapper for @/)
Expo: app.config.ts / app.json
Linting/Format: .eslintrc.*, .prettierrc*
Babel: babel.config.js/ts if present
Hidden dependencies / conventions

Path alias @/ is widely used; keep alias mapping in tsconfig and jest config in sync.
Theme tokens should be used in new styles; avoid reintroducing removed legacy color keys.
Testing environment expects jest-expo and jsdom-compatible DOM shims for web-targeted code.
4) CI & Local Parity
CI (if configured under .github/workflows/):
Mirror these locally and in this order:

npm ci
npm run lint
npm run typecheck
npm test
(Optional) npx expo-doctor
Agents should simulate CI locally using the exact sequence above before committing changes.

5) Working Rules for Agents
Trust this document. Only search when a script/config is missing or instructions fail.
Don’t introduce heavy native deps that break managed Expo unless explicitly required.
Do respect path aliases and theme tokens.
Do keep changes small and incremental; include/update tests when modifying logic.
Always run: lint → typecheck → test before opening a PR.
If Metro fails, clear cache via npx expo start -c.
If tests fail on aliasing, align tsconfig.paths and jest.moduleNameMapper.
6) Canonical Commands (assume these exist; prefer these names)
# install deps (local)
npm install

# install deps (CI)
npm ci

# start dev server
npx expo start

# platform runs
npm run android
npm run ios
npx expo run:android
npx expo run:ios

# quality gates
npm run lint
npm run typecheck
npm test

# optional health check
npx expo-doctor


If any script name differs in package.json, update this file and use the project’s script as the single source of truth.

---

### How to use this
1) Create a branch, e.g. `chore/copilot-onboarding-doc`.  
2) Add the file above at `.github/copilot-instructions.md`.  
3) Open this PR with the provided title/description.  
4) Merge after approval.

If you want, I can also generate a short follow-up PR to align `jest.moduleNameMapper` with your `tsconfig.paths` and add a `npm run verify` script that chains `lint && typecheck && test` for a one-shot local CI.
Thank you!