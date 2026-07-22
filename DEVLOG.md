# Greenie — Development Log

Entries are in reverse chronological order. Each entry corresponds to a working session.

---

## 2026-07-22

**What we did**
Completed Milestone 2: Authentication. Students and organizations can now create accounts, sign in, and be routed to their respective dashboards. Session persists across app restarts via AsyncStorage.

**Decisions made**
- Used a `profiles` table to store `account_type` and `full_name` separate from Supabase Auth, which only stores credentials. This is standard practice — Auth handles identity, the database handles profile data.
- Disabled Supabase email confirmation for MVP. Adds friction without value during development; can be re-enabled before launch.
- Used Expo Router route groups (`(auth)`, `(student)`, `(org)`) to separate screen layouts without affecting URL paths.
- Routing logic lives entirely in `app/index.tsx` — one place determines where a user lands after the app loads.

**Challenges**
- The new Supabase `sb_publishable_` key format works for auth but the `profiles` table was missing `GRANT` permissions for the `authenticated` role. RLS policies only filter rows — they don't grant table access. Both are required.
- `react-native-reanimated` v4 requires `react-native-worklets` as a separate package. `babel-preset-expo` auto-detects both and applies their Babel plugins. Installing worklets@0.8.3 resolved the bundler chain.
- Supabase error objects are not `instanceof Error`, so the original catch blocks were hiding the real error message behind a generic "sign up failed" string.

**Next steps**
Begin Milestone 3: Opportunity discovery — database schema for opportunities, swipe-based card UI, opportunity detail view, and sign-up flow.

---

## 2026-07-18 (continued x2)

**What we did**
Got NativeWind working. `className` styling now renders correctly on device — "Greenie" appears in green via `text-green-600`, white background via `bg-white`. Milestone 1 is fully complete.

**Decisions made**
- Removed `nativewind/babel` from babel config entirely; using `jsxImportSource: 'nativewind'` inside `babel-preset-expo` instead. This avoids the `react-native-worklets/plugin` error.
- Installed `react-native-reanimated@4.1.7` (Expo SDK 54 compatible). NativeWind's runtime (`react-native-css-interop`) requires it at bundle time for CSS animation support, even though we're not using animations.

**Challenges**
- `react-native-css-interop` has a hard runtime `require('react-native-reanimated')` inside its animation handler. Metro resolves all requires at bundle time, so the module must be installed even if animations are never used.
- The two separate errors (Babel plugin for worklets vs. Metro runtime resolution) had the same root cause but manifested differently, which made them look like unrelated problems.

**Next steps**
Begin Milestone 2: Authentication — student and organization account creation, sign-in/sign-out, session persistence, and routing by account type.

---

## 2026-07-18 (continued)

**What we did**
Got the app running on an iPhone via Expo Go after an extended debugging session. Resolved SDK version mismatch by targeting Expo SDK 54 to match the installed Expo Go version. Confirmed the app loads and renders correctly on device.

**Decisions made**
- Targeting Expo SDK 54 (not 57 as originally scaffolded) to match the version of Expo Go available on the development device.
- NativeWind stripped out temporarily during debugging to isolate issues — will be re-added cleanly.
- Using StyleSheet API for now; className-based styling to follow.

**Challenges**
- Expo SDK 57 was too new for Expo Go; SDK 52 was too old. SDK 54 matched exactly.
- The QR code generated early in the session pointed to a stale IP (192.168.18.182). The actual IP was 10.105.1.113, which caused all connection attempts to silently fail.
- react-native-reanimated v4 pulled in react-native-worklets as a dependency that was not installable cleanly — removed entirely since we don't need animations yet.
- The `create-expo-app` blank template required manual entry point wiring (index.ts → expo-router/entry) which was not obvious from the docs.

**Next steps**
Re-add NativeWind for SDK 54, verify className styling works, then commit and begin Milestone 2: Authentication.

---

## 2026-07-18

**What we did**
Completed Milestone 1: project setup. Scaffolded the Expo app with TypeScript, configured Expo Router for file-based navigation, installed and configured NativeWind for Tailwind CSS styling, installed the Supabase JS client, and established the folder structure (app, components, lib, services, stores, types). Updated CLAUDE.md with code conventions, updated README with project structure.

**Decisions made**
- Used `--legacy-peer-deps` to resolve a NativeWind/Tailwind peer dependency conflict caused by Expo SDK 57 being very new. Not a breaking issue — just an npm resolution flag.
- `.env` added to `.gitignore` manually since the Expo template only covered `.env*.local`.
- Screens call service functions rather than Supabase directly — keeps screens clean and data layer swappable.

**Challenges**
- `create-expo-app` refused to scaffold into a non-empty directory. Solved by scaffolding in a temp directory and copying the generated files over.
- NativeWind installation failed on first attempt due to a peer dependency conflict with React 19. Resolved with `--legacy-peer-deps`.

**Next steps**
User creates a Supabase project and adds credentials to `.env`. Then run the app with `npx expo start` and scan QR code with Expo Go to verify the full stack is working.

---

## 2026-07-12

**What we did**
Defined the project from scratch. Established the tech stack, scoped the MVP, and created the full documentation foundation: CLAUDE.md, REQUIREMENTS.md, ROADMAP.md, DEVLOG.md, and README.md (in progress).

**Decisions made**
- Chose React Native + Expo for cross-platform mobile development.
- Chose Supabase as the backend for its PostgreSQL database, built-in authentication, and real-time capabilities.
- Chose Expo Router, NativeWind, and Zustand to complete the stack.
- Defined MVP scope: student and org accounts, swipe-based discovery, hour logging, org verification, XP and level progression, student dashboard.
- Treated XP and leveling as core identity features, not optional enhancements.
- Deferred streaks, badges, leaderboards, notifications, and social features to Phase 2+.

**Challenges**
None technical yet. Main challenge was resisting the urge to over-scope the MVP — keeping the feature list focused and honest.

**Next steps**
Write README.md, then begin Milestone 1: project setup (Expo app, Supabase connection, folder structure, GitHub push).
