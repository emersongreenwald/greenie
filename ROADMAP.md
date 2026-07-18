# Greenie — Roadmap

## Approach

Features are built in dependency order: backend and data models before UI, authentication before anything that requires a user, and core loops before polish. Each milestone should be fully working before the next begins.

---

## Phase 1 — MVP

### Milestone 1: Project Setup
*Goal: A working development environment with the full stack connected.*

- Initialize Expo project with TypeScript
- Configure Expo Router for navigation
- Set up NativeWind for styling
- Create Supabase project and connect it to the app
- Define folder structure and code conventions
- Push initial project to GitHub

**Done when:** The app runs on a simulator, navigation works between placeholder screens, and the app can make a test query to Supabase.

---

### Milestone 2: Authentication
*Goal: Users can create accounts and sign in.*

- Design the user database schema (students, organizations, schools)
- Build sign-up flow for students (name, email, password, school selection)
- Build sign-up flow for organizations (name, description, contact)
- Build sign-in and sign-out for both user types
- Persist session across app restarts
- Route users to the correct home screen based on account type

**Done when:** A student and an organization can each create an account, sign in, and see a screen appropriate to their role.

---

### Milestone 3: Opportunities
*Goal: Organizations can post opportunities and students can discover them through a swipe interface.*

- Design the opportunities database schema
- Build the organization flow to create and publish a volunteer opportunity
- Build the swipe card UI for student opportunity discovery
- Build the opportunity detail screen
- Allow students to sign up for an opportunity
- Allow organizations to see who has signed up

**Done when:** An organization can post an opportunity, a student can swipe through cards and sign up, and the sign-up is reflected on the organization side.

---

### Milestone 4: Hour Logging and Verification
*Goal: Students can log hours and organizations can verify them.*

- Build the student flow to submit a log entry for a completed opportunity
- Build the organization dashboard for reviewing pending logs
- Allow organizations to approve or reject log entries
- Award XP to students when hours are verified
- Store verified hours and XP on the student's record

**Done when:** A student can log hours, an organization can approve them, and the student's XP increases as a result.

---

### Milestone 5: Dashboard and Gamification
*Goal: Students can see their progress and experience the level system.*

- Define XP thresholds for each level
- Build the student dashboard (total verified hours, XP, current level, progress to next level)
- Add a level-up moment in the UI when a student reaches a new level
- Polish the overall app flow from sign-up through verification

**Done when:** The complete core loop works end-to-end — sign up, discover, sign up for an opportunity, complete it, log hours, get verified, earn XP, level up, and see it reflected on the dashboard.

---

## Phase 2 — Engagement Layer
Streaks, badges, achievements, challenges, leaderboards, push notifications.

## Phase 3 — Platform Expansion
School admin dashboard, volunteer history, search and filtering, location-based discovery, organization analytics.

## Phase 4 — Social and Polish
Social features, messaging, public profiles, onboarding flow, featured opportunities.
