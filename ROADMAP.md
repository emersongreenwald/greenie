# Greenie — Roadmap

Last updated: 2026-07-30

---

## Where We Are

**8 milestones complete. The core product is built and pitch-ready.**

The MVP scope defined in CLAUDE.md is 100% done. All three stakeholder groups — students, organizations, and schools — have working, end-to-end experiences. What remains is polish, convenience features, and long-term platform growth.

---

## Completed Milestones

### ✅ Milestone 1 — Project Setup
Expo + TypeScript, Expo Router, NativeWind, Supabase connection, folder structure, GitHub.

### ✅ Milestone 2 — Authentication
Student and org sign-up/sign-in, session persistence, routing by account type. `profiles` table with `account_type`, `school_name`, `graduation_year`, `phone`.

### ✅ Milestone 3 — Opportunity Discovery
Swipe card stack (PanResponder + Animated), opportunity detail screen, sign-up flow. Join/skip badge overlays on swipe.

### ✅ Milestone 4 — Hour Logging & Verification
Student hour logging form (`actual_date` + `service_description`), org verification queue, Postgres trigger that awards XP on verification, one-log-per-opportunity constraint.

### ✅ Milestone 5 — UI Design
Warm earthy color system (`#557A62` brand green, `#faf8f4` cream, `#1c2620` charcoal), Manrope typeface (5 weights), Ionicons, tab bar (discover + profile), `XPBar` component, card shadows, design tokens in `constants/theme.ts` and `tailwind.config.js`.

### ✅ Milestone 6 — Personality & Gamification
Pastel confetti on hour submission, floating `+N xp` on dashboard load, full copy rewrite (warm, lowercase, personal tone), weekly streak tracking (ISO week, Postgres trigger), welcome/onboarding screen ("doing good shouldn't be hard.").

### ✅ Milestone 7 — Org & School Tools
**Org:** post, view, and delete opportunities; verified-org trust gate (`profiles.verified` boolean, manual flip in Supabase); org dashboard with pending count + opportunity count.
**School:** school admin account type, school dashboard with ranked student list (verified hours, level), exact school-name matching for MVP.

### ✅ Milestone 8 — Records, Rosters & Trust
Student service record screen (formal document layout, designed for college apps and eventual PDF export). Org signup roster with student removal. Optional capacity limits with live "X spots left" display. Student signup cancellation (before hours logged). RLS policies on `opportunity_signups` enforcing privacy at the database level.

---

## Up Next — Pre-Pitch Polish

These are small, well-scoped tasks. Neither is blocking a pitch, but both will be visible gaps in a live demo.

### ✅ School Student Detail View
Tapping a student in the school dashboard opens their full service log alongside verified hours, level, and streak. Reuses existing service functions — no new database queries needed.

### 🔲 Org Edit Opportunity
**Size: Small (1 screen)**
Orgs can post and delete but not edit. If they make a typo or need to update a date, they have to delete and repost. A straightforward form pre-populated with existing values.

---

## Post-Pitch — Near Term

Features that matter for real users but aren't needed for a demo.

### 🔲 Service Record PDF / Share Export
The service record screen is already designed with export in mind. Wire up `react-native-view-shot` or a similar library to capture the screen and share it as a PDF or image. This is the payoff for the document-style design.

### 🔲 Verified Org Onboarding Flow
Right now orgs sign up and their opportunities are hidden until Emerson manually flips `verified = true` in Supabase. Build a lightweight review step — even just an email notification — so this doesn't require opening the database console every time.

### 🔲 Proper School Matching
Currently students and schools are matched by exact text (`school_name` string). Phase 3 replaces this with a `schools` table. School admins register their school; students pick from a list at sign-up. Requires a migration: match existing strings to school rows, replace with a foreign key.

---

## Long-Term Roadmap

Deferred until the platform has real users and real usage data to justify the complexity.

| Feature | Notes |
|---|---|
| Waitlists | When a student cancels a capped opportunity, notify the next person. Requires notification infrastructure first. |
| Push notifications | Hour verified, new opportunity nearby, streak reminder. Requires Expo Notifications setup. |
| Leaderboards | School-wide or platform-wide rankings by hours. Data already exists; needs a screen and careful privacy design. |
| Badges & achievements | First volunteer session, 10-hour milestone, streak achievements, etc. |
| Challenges | Weekly or monthly goals set by schools or orgs. |
| Admin account type | Platform-wide analytics dashboard for Emerson. XP, users, orgs, hours across the whole platform. Deferred to avoid one-off email-gating logic. |
| District adoption | `districts` table → `schools` table → `profiles`. Lets a superintendent see all schools at once. |
| Social features | Public profiles, activity feed, following orgs. Phase 4+. |
| Location-based filtering | Discover screen filtered by proximity. Requires location permission flow. |
| Advanced org analytics | Attendance rates, repeat volunteers, hours by opportunity. |
| Resubmission after rejection | Currently a student can't resubmit after an org rejects their hours. Needs UX design. |
