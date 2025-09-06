# Copilot Coding Agent Onboarding

> **Read me first.** Trust this document as the source of truth for how to work in this repo. Only perform broad code searches if the information here is incomplete or demonstrably incorrect.

## 1) High-Level Details

**What this repository does**  
A mobile-first app built with **Expo / React Native (TypeScript)**. It includes screens/components, state stores, utilities, and tests (Jest) for UI and logic. The project targets Android, iOS, and Web (Expo web).

**Repo profile (at a glance)**  
- **Type:** Monorepo-like single app (Expo RN)  
- **Primary languages:** TypeScript, JavaScript  
- **Frameworks/tooling:** Expo, React Native, Expo Router, TanStack Query, Jest (with `jest-expo`), ESLint + Prettier  
- **Configs you'll likely need:** `package.json`, `tsconfig.json`, `app.config.ts`/`app.json`, `jest.config.*`, `.eslintrc.*`, `.prettierrc*`, possibly `babel.config.js/ts`  
- **Typical structure:**  
  - `app/` or `src/` (screens, navigation)  
  - `components/` (reusable UI)  
  - `stores/` (Zustand/Context)  
  - `hooks/` (custom hooks)  
  - `constants/` (theme, colors, tokens)  
  - `utils/`  
  - `_tests_/` (Jest tests)  
  - `.github/workflows/` (CI if configured)

> If using path aliases like `@/`, ensure `tsconfig.json` has `baseUrl`/`paths`, and Jest's `moduleNameMapper` matches.

---

## 2) Build & Validation Instructions (follow this exact order)

**Environments (choose one and stick to it):**
- **Node:** Use the version declared in `package.json > engines` if present; otherwise prefer **Node 20 LTS** and **npm 10**.  
- **Package manager:** **npm** is canonical here (use `npm ci` on CI, `npm install` locally). Avoid mixing bun/pnpm unless scripts explicitly support them.  
- **Expo CLI:** Installed via `node_modules` (use `npx expo ...`).

> **Always** start by installing deps: `npm install` (local) or `npm ci` (CI).

### A. Bootstrap (first-time or after fresh clone)
1. `npm install`  
2. (Optional) Copy envs if they exist: `cp .env.example .env.local`  
3. Sanity check the project: `npx expo-doctor` (if available)

**Common pitfalls & fixes**
- Metro cache issues → `npx expo start -c`  
- Path aliases not recognized in tests → ensure `jest.config.*` has `moduleNameMapper` for `@/`  
- TypeScript isolated module errors → run `npm run typecheck` to surface them

### B. Lint → Typecheck → Test (fast feedback loop)
1. `npm run lint`  
2. `npm run typecheck`  (e.g., `tsc --noEmit`)  
3. `npm test`  (Jest; uses `jest-expo` preset for RN/Expo)

> **Always** run **lint → typecheck → test** before pushing. Fix errors/warnings they surface.

### C. Run (local dev)
- Metro/Web UI: `npx expo start`  
  - Web: press `w` or use `--web`  
  - Android: `npm run android` (or `npx expo run:android`)  
  - iOS (macOS): `npm run ios` (or `npx expo run:ios`)

**Notes**
- On Windows + WSL: prefer running Metro on the same side as your emulator/device to avoid file watch issues. If using WSL, connect `adb` over TCP.

### D. Production-style build (when needed)
- Managed app build may use EAS; otherwise, platform runs:  
  - Android: `npx expo run:android` then Gradle assembles  
  - iOS: `npx expo run:ios` (requires Xcode/macOS)

> If EAS is configured, refer to `eas.json`; otherwise default to run:platform flows above.

---

## 3) Project Layout & Where Things Live

- **Entry & routing**: `app/` (Expo Router) with stacks/layouts; screens are typically `app/<route>.tsx`.  
- **Components**: `components/` for reusable UI.  
- **State**: `stores/` (e.g., Zustand or Context providers).  
- **Hooks**: `hooks/` for shared logic (e.g., `useLocation`, data fetching).  
- **Theming**: `constants/` (e.g., tokens like `theme.colors.surface`, `textSecondary`). Prefer theme tokens over legacy color constants.  
- **Utilities**: `utils/` (analytics, performance, formatters).  
- **Tests**: `_tests_/` using Jest + `jest-expo`. UI tests co-located or under `_tests_`.  
- **Configs**:  
  - **TypeScript:** `tsconfig.json` (check `baseUrl`, `paths`)  
  - **Jest:** `jest.config.js/ts` (ensure `preset: "jest-expo"`, `moduleNameMapper` for `@/`)  
  - **Expo:** `app.config.ts` / `app.json`  
  - **Linting/Format:** `.eslintrc.*`, `.prettierrc*`  
  - **Babel:** `babel.config.js/ts` if present

**Hidden dependencies / conventions**
- **Path alias `@/`** is widely used; keep alias mapping in **tsconfig** and **jest config** in sync.  
- **Theme tokens** should be used in new styles; avoid reintroducing removed legacy color keys.  
- **Testing environment** expects `jest-expo` and `jsdom`-compatible DOM shims for web-targeted code.

---

## 4) CI & Local Parity

**CI (if configured under `.github/workflows/`):**  
Mirror these locally and **in this order**:
1. `npm ci`  
2. `npm run lint`  
3. `npm run typecheck`  
4. `npm test`  
5. (Optional) `npx expo-doctor`

> Agents should **simulate CI locally** using the exact sequence above before committing changes.

---

## 5) Working Rules for Agents

- **Trust this document.** Only search when a script/config is missing or instructions fail.  
- **Don't** introduce heavy native deps that break managed Expo unless explicitly required.  
- **Do** respect path aliases and theme tokens.  
- **Do** keep changes small and incremental; include/update tests when modifying logic.  
- **Always** run: `lint → typecheck → test` before opening a PR.  
- **If Metro fails**, clear cache via `npx expo start -c`.  
- **If tests fail on aliasing**, align `tsconfig.paths` and `jest.moduleNameMapper`.

---

## 6) Canonical Commands (assume these exist; prefer these names)

```bash
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
```

If any script name differs in package.json, update this file and use the project's script as the single source of truth.
