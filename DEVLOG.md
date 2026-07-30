# Greenie — Development Log

Entries are in reverse chronological order. Each entry corresponds to a working session.

---

## 2026-07-29 (continued x2)

**What we did**
Built the org signup roster — orgs can now tap "view sign-up roster" on any opportunity card to see every student who signed up, with their name, school, and the date they joined.

**Decisions made**
- Roster navigates to `app/(org)/opportunity-signups/[opportunityId].tsx` with the opportunity title passed as a query param (avoids a second fetch just to show the header).
- Students are listed in sign-up order (ascending) with a position number — gives the org a sense of who committed earliest.
- Each row shows name + school + "joined [date]". Kept simple: the verification screen already handles hours status, so the roster's job is just "who is coming?"
- The count badge at the top ("N students signed up") gives the org an at-a-glance answer without having to count the list.
- Added `SignupEntry` interface to `types/opportunity.ts` (separate from `OpportunitySignup`) to represent the join query result that includes the student profile data.

**Next steps**
Consider: (1) school student detail view (tap a student in the school dashboard → see their individual logs), (2) org edit opportunity, (3) service record PDF/share export.

---

## 2026-07-29 (continued)

**What we did**
Built the student service record screen — a formal, document-like view of a student's verified community service, designed for college applications and eventual PDF export.

**Decisions made**
- White background (not cream), no XP/levels/streaks/confetti — deliberately different visual register from the rest of the app to signal this is an official document.
- "greenie" wordmark (small, ExtraBold, brand green) is the only branded element. Every other color is neutral charcoal, muted sage, or warm gray.
- Three-stat summary row (verified hours / organizations / completed) uses `#e0d9d0` border dividers — the same weight used throughout the document for horizontal rules.
- Org name renders in brand green inside each entry — the only accent color in the log, connecting a specific entry to its verifying organization.
- Student description quoted in italics below each entry. Provides voice and specificity that a college counselor can't get from a plain list.
- Date formatted as "July 29, 2026" (not ISO) for document readability. `actual_date + 'T12:00:00'` prevents timezone boundary bugs.
- Footer "verified by greenie · greenie.app" matches the visual language of an official document seal.
- Dashboard entry point is a card-style row with "service record / official log of your verified hours" and a document icon — understated, not a primary action.

**Next steps**
Consider: (1) org signup roster (who signed up for each opportunity), (2) school student detail view, (3) PDF/share export for the service record.

---

## 2026-07-29

**What we did**
Built the school admin dashboard — the final piece needed for a complete pitch. School admins can create accounts, sign in, and see every student from their school with verified hours and level, sorted by most hours.

**Decisions made**
- School matching is exact text — the school admin types "East Hampton High School" at sign-up, and students who typed the same string appear in their dashboard. Simple and correct for a controlled demo environment. Phase 3 will replace this with a proper `schools` table and student dropdown.
- School admin link on welcome screen is intentionally smaller and more muted than student/org buttons. Schools are onboarded deliberately (not organically), so the path should be discoverable but not prominent.
- The empty state in the school dashboard shows the exact school name in quotes ("students who sign up with '...' will appear here") — this immediately tells an admin if their school name doesn't match what students typed.
- Two summary cards (students count + total hours) give the counselor a quick aggregate before scrolling into the student list.
- Students are ranked by verified hours (descending) with a position number — familiar to school staff, and motivating for students if they ever see it.

**Next steps**
Full pitch-ready prototype is complete. Priority order: (1) real demo with at least one org and one school in the Hamptons, (2) fix any issues that surface during the demo, (3) frog mascot / polish pass before formal pitches in September.

---

## 2026-07-28 (continued x3)

**What we did**
Built the org opportunity management flow — the missing piece that makes orgs self-sufficient. Orgs can now post, view, and delete their own opportunities entirely within the app, without any SQL needed. Added verified-org filtering so only trusted orgs appear in the student feed.

**Decisions made**
- Added a `verified BOOLEAN DEFAULT false` column to profiles. Orgs can post immediately after signing up, but their opportunities are hidden from students until the `verified` flag is manually flipped in Supabase. This gives us a human review step without building an admin UI yet.
- Filtering by verified orgs is done client-side in `getOpportunities()` (joining `profiles.verified` and filtering before return). Avoids unreliable PostgREST join-column filter syntax — a pitfall we hit earlier with `opportunity_signups`.
- Org dashboard now shows two stat cards: pending verifications and opportunity count. Both tap through to their respective management screens.
- Date input on the create form is plain text (`mm/dd/yyyy`) with a `parseDate()` helper that converts to `yyyy-mm-dd` for the database. Simple and reliable for MVP without adding a date picker dependency.
- Input component extended to support `multiline` — sets `textAlignVertical: 'top'` and `minHeight: 100` on Android/iOS for the description field.

**Next steps**
School admin dashboard — the second pitch-critical piece. Lets guidance counselors see their students' verified hours.

---

## 2026-07-28 (continued x2)

**What we did**
Finished Phase 2 with three UX features: weekly streak tracking, a welcome/onboarding screen, and swipe overlays on the discover screen.

**Decisions made**
- Streaks are weekly and verification-triggered (same event as XP), so students never ask "why did my streak go up but my XP didn't?" ISO week format (`2026-W31`) stored in `last_streak_week` TEXT column — readable, sortable, and avoids timezone edge cases.
- Three CASE branches in the trigger: already credited this week → no change; last week credited → increment; any gap → reset to 1. Multiple verifications in a single week only count once.
- Streak label changed from "day streak" to "week streak" — sets correct expectations. Weekly cadence is more realistic for volunteer schedules than daily.
- Pending-log note ("your streak will update once your hours are verified.") shown directly inside the streak card when a pending log exists. Reassuring, not anxious — students know exactly why the number hasn't moved.
- Welcome screen redirects unauthenticated users instead of landing on sign-in. "doing good shouldn't be hard." is the first copy a new user reads.
- Swipe overlays use interpolated opacity from the existing `position.x` Animated.Value — zero new state. "join" badge fades in on rightward drag (brand green, −12° tilt); "skip" badge fades in on leftward drag (warm taupe, +12° tilt).

**Next steps**
Phase 2 is complete. Consider: (1) real test with a Hamptons school/org, (2) adding a frog mascot illustration now that the visual system is stable, or (3) beginning Phase 3 (school admin dashboards, verified service record export).

---

## 2026-07-28 (continued)

**What we did**
Added personality and life to the UI: pastel confetti burst on hour submission, animated XP bar fill on profile load, floating "+N xp" indicator when new XP is detected, and a full copy rewrite across every screen. The app now speaks in a warm, personal tone instead of a clinical one.

**Decisions made**
- Confetti uses pastel colors (pink, yellow, blue, peach, mint, lavender) instead of brand green/gold. Reason: brand-colored confetti feels like a UI element; pastel confetti feels like a real celebration.
- The +XP float only appears when the dashboard detects a genuine XP increase (fresh profile XP > cached XP). It doesn't show on every load — only when something real happened.
- Copy is consistently lowercase and conversational: "hey, emerson!", "you're in!", "waiting on your org", "nice work!", "keep growing". This is a deliberate product voice decision, not just stylistic preference.
- Encouraging messages on the success screen ("the community thanks you.", "you showed up!", etc.) rotate randomly so repeat users don't see the same phrase every time.
- Frog mascot idea noted for later — placeholder leaf icon approach deferred until a real illustration exists.

**Next steps**
MVP feature set is complete. Deciding between: (1) streak tracking backend to give the streak placeholder a real number, or (2) beginning Phase 2 (verified service records / PDF export).

---

## 2026-07-28

**What we did**
Completed the UI milestone (Milestone 5): premium visual redesign across the entire app. Updated the color system to a warm, earthy palette (forest green `#557A62`, cream `#faf8f4`, charcoal `#1c2620`, gold for XP). Installed Manrope as the custom typeface (ExtraBold for wordmarks, Bold for headings, SemiBold for labels, Regular for body). Added Ionicons for all icons (calendar, location, time, checkmarks, back arrows). Converted the student layout from a Stack to a tab bar with compass (discover) and person-circle (profile) tabs. Built a new `XPBar` component in gold. Added a `shadows.card` constant in theme.ts to eliminate repeated shadow declarations across cards.

**Decisions made**
- Discover is the home tab, not the dashboard. Matches the mental model of TikTok/Duolingo — the action is the home, the stats are the profile. Students open the app to find opportunities, not to review their stats.
- No emojis anywhere. All iconography from Ionicons (`@expo/vector-icons`, already bundled with Expo).
- "greenie" wordmark as text (Manrope ExtraBold, brand green) until a custom logo/mascot is designed.
- All UI text is lowercase to match the app's tone — casual, peer-to-peer, not institutional.
- Streak shows "0" as a placeholder. The visual is correct; the tracking backend is the next milestone.
- `fonts` and `shadows.card` exported from `constants/theme.ts` — all per-screen repetition eliminated.
- Tab bar routes `opportunity/[id]` and `log-hours/[opportunityId]` are declared with `href: null` to hide them from the tab bar while keeping them navigable.

**Challenges**
- Fonts must be loaded before the root layout renders — added `useFonts` hook from `@expo-google-fonts/manrope` and returned `null` from the root layout until they load (splash screen stays visible).
- Font families in React Native require `style={{ fontFamily: '...' }}` alongside `className` — there's no Tailwind class for custom fonts. Every text element needs both.

**Next steps**
Streak tracking backend: add a `last_active_date` and `streak` field to the `profiles` table, update via trigger or client logic whenever a student completes a service log, and wire up the streak display on the profile screen.

---

## 2026-07-24

**What we did**
Completed Milestone 4: Hour logging, org verification, and XP progression. Students can log hours after completing an opportunity; organizations review and verify or reject submissions; XP is automatically awarded upon verification. The student dashboard is now fully real: level badge, XP progress bar, and a per-opportunity list showing submission status. The org dashboard shows a pending count that links to the verification queue.

Also made a set of architecture decisions for future school integration before writing any code: added `school_name` and `graduation_year` to student profiles, added `phone` to org profiles, and designed `hour_logs` to capture `actual_date` (when the service happened) separately from `submitted_at` (when the form was submitted) — critical for school service records.

**Decisions made**
- XP is calculated by a Postgres trigger, not by the client. The trigger fires when `hour_logs.status` changes to `'verified'` and updates `profiles.xp` and `profiles.level`. This can't be spoofed from the app.
- XP formula: `round(hours_logged * 10)` XP per verified log. Level = `floor(xp / 100) + 1`. Each level is exactly 100 XP.
- `school_name` is stored as plain text now. The plan is to replace it with a `school_id` FK in Phase 3 when school accounts are added — a simple migration. Not capturing it now would mean a painful user outreach campaign later.
- `actual_date` is required on hour logs. Schools care about when the service happened, not when the student submitted the form.
- One log per opportunity (`unique(opportunity_id, student_id)` constraint). Resubmission after rejection is deferred to a later milestone.
- Optimistic updates on the org verification screen: cards disappear immediately on verify/reject without waiting for the network response. Makes the UI feel instant.
- Date parsing: `actual_date + 'T12:00:00'` before calling `new Date()` to prevent timezone boundary bugs.

**Challenges**
- None significant — the architecture decisions took more thought than the code itself.

**Next steps**
All MVP features are now implemented. Next: UI milestone — redesign the visual layer using the theme system we built, then prep for a real test with Hamptons-area schools and organizations.

---

## 2026-07-23

**What we did**
Completed Milestone 3: Opportunity discovery. Students can swipe through a stack of volunteer opportunities, tap a card to see full details, and sign up. Seeded the database with four Hamptons-area test opportunities.

**Decisions made**
- Built the swipe gesture from scratch using React Native's `PanResponder` + `Animated.Value` rather than a third-party library. More code, but no new dependencies and full control over behavior.
- Separated the gesture logic (`SwipeCard`) from the visual content (`OpportunityCard`). `SwipeCard` is generic — it can wrap anything. `OpportunityCard` only handles appearance.
- Swipe right = sign up immediately; tap = detail view with explicit sign-up button. Both paths create the same `opportunity_signups` row.
- Used `key={currentIndex}` on `SwipeCard` so React recreates the component (and resets gesture state) each time the index advances.
- Seeded test opportunities via SQL subquery selecting by `account_type = 'org'` so no hardcoded user IDs were needed.

**Challenges**
- None significant — the architecture from Milestones 1 and 2 made this straightforward to build on.

**Next steps**
Milestone 4: Hour logging and verification — students log hours after completing an opportunity, organizations verify them, XP is awarded upon verification.

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
