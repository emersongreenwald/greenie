# Greenie — Requirements

## MVP Features

These features define the complete core experience of Greenie. The MVP is considered done when all of them are working end-to-end.

---

### Accounts

**Student account creation**
Students register with their name, email, password, and school. Each student has a profile that tracks their hours, XP, and level.

**Organization account creation**
Local nonprofits and grassroots organizations register with their organization name, description, and contact information. Organizations can post opportunities and verify student hours.

**School association**
During registration, students select their school from a list. School association is used to contextualize progress and support future school-level features.

**Authentication**
All users can sign in and sign out securely. Sessions persist across app restarts.

---

### Opportunities

**Swipe-based discovery**
Students browse opportunities using a swipe card interface. Swiping right saves the opportunity or initiates sign-up. Swiping left skips it. Cards display the opportunity name, organization, date, and a brief description.

**Opportunity detail view**
Tapping a card opens a full detail view with the opportunity name, organization, description, date, time, location, and available spots. Students can sign up from this view.

**Sign-up**
Students can sign up for an opportunity. Organizations can see who has signed up.

---

### Hour Logging and Verification

**Hour logging**
After completing service, a student submits a log entry for an opportunity they signed up for. The entry includes the number of hours completed and an optional note.

**Organization verification**
Organizations review pending hour logs submitted by students. They can approve or reject each entry. Approved logs count toward the student's total verified hours and trigger XP.

---

### Gamification

**XP progression**
Students earn XP when an organization verifies their hours. XP is calculated based on hours completed. The formula can be adjusted later but should start simple (e.g., 10 XP per verified hour).

**Level system**
Students advance through levels as they accumulate XP. Levels use fixed XP thresholds. Reaching a new level should feel like a meaningful moment in the UI.

**Student dashboard**
Each student has a dashboard showing their total verified hours, current XP, current level, and progress toward the next level.

---

## Future Phases

These features are intentionally deferred. They enhance the experience but are not required to demonstrate Greenie's core concept.

### Phase 2 — Engagement Layer
- Daily streaks for consecutive days with verified activity
- Badges and achievements for milestones (first hour, 10 hours, first sign-up, etc.)
- Challenges (weekly goals, themed events)
- Leaderboards (school-wide or app-wide XP rankings)
- Push notifications (reminders, verification alerts, streak warnings)

### Phase 3 — Platform Expansion
- School admin dashboard for viewing student participation and managing school-level data
- Volunteer history timeline on student profiles
- Search and filtering for opportunities (by date, category, organization, location)
- Location-based opportunity discovery
- Advanced analytics for organizations (sign-up rates, completion rates)

### Phase 4 — Social and Polish
- Social features (sharing achievements, following friends)
- In-app messaging between students and organizations
- Public student profiles
- Featured opportunities and organization spotlights
- Onboarding flow for new users
