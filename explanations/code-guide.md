# Greenie — Code Guide

Plain-English explanations of every important file in the project. Updated after every milestone.

---

## Architecture Decisions

This section explains the major design choices that shape the whole codebase — not how a specific file works, but *why* things are structured the way they are. These decisions will affect every future feature, so they're worth understanding deeply.

### Decision 1: `school_name` is a text field (not a foreign key) — for now

In Milestone 4 we added `school_name` and `graduation_year` to the student profile as plain text columns. You might wonder: shouldn't `school_name` point to a `schools` table instead of just storing a string?

The answer is: eventually yes, but not yet. We don't have school accounts. We don't have a `schools` table. And most importantly, we can't link to something that doesn't exist.

The plan is:
1. **Now (MVP):** `profiles.school_name = "East Hampton High School"` — a string the student types at sign-up.
2. **Phase 3:** Create a `schools` table. Each row = one school. Run a migration that matches the string to the school row and replaces the string with a foreign key ID.
3. **Phase 4:** `profiles.school_id` references `schools.id`, which references `districts.id`.

Capturing the string now costs almost nothing. *Not* capturing it now means doing a painful outreach campaign to every existing user later to fill in their school. Always capture data at the earliest natural opportunity — you can restructure it later, but you can't recover data you never collected.

### Decision 2: XP is calculated and awarded by the database (not the app)

When an organization verifies a student's hours, a Postgres trigger fires and adds XP to the student's profile. The app never sends XP to the database — it only reads it.

Why? Because anything the app sends can be intercepted. If the client calculated XP and sent it in an API call, a malicious user could send any number they wanted. By calculating XP inside a database trigger that only fires on a legitimate status change, there's no API call to intercept or manipulate.

The formula (`round(hours_logged * 10)`) lives in the trigger, not in the TypeScript code. The TypeScript code that *displays* XP gain on the dashboard uses the same formula — but only for display purposes. The real XP in the database came from the trigger, not from JavaScript.

This is the same reason banks calculate your balance on the server, not in your browser.

### Decision 3: `actual_date` is separate from `submitted_at`

The `hour_logs` table has two date fields:
- `submitted_at` — when the student filled out the form in the app (set automatically by Postgres)
- `actual_date` — when the community service actually happened (entered by the student)

These are almost always different. A student might complete beach cleanup on Saturday but not open the app until Monday. Schools need the service date, not the submission date. If we only had `submitted_at`, every service record would say the work happened Monday.

This also matters for school reporting: a counselor reviewing a transcript needs to see "cleaned the beach on June 15" — not "submitted a form on June 17."

### Decision 4: `hour_logs` is the canonical unit of the platform

Every other table in the app builds toward or queries the `hour_logs` table:

```
profiles (students) ──→ hour_logs ←── opportunities ←── profiles (orgs)
```

Phase 2 (service records) generates a PDF by reading verified `hour_logs` for a student.
Phase 3 (school dashboards) lets counselors query `hour_logs` filtered by `school_name` to see total hours for all students.
Phase 4 (district adoption) aggregates `hour_logs` across all schools in a district.

None of those phases require changes to the `hour_logs` schema — just new ways of querying the data that's already there. This is good database design: design tables around facts (a student did X hours on Y date for Z organization), not around features (what the current UI needs to show).

### Decision 6: Design tokens live in two files; fonts need `style` props, not class names

In the UI milestone we added `fonts`, `shadows`, and new color tokens. Here's how the system works now:

- **Color classes** (`bg-cream`, `text-charcoal`, `bg-gold`, `border-blush`) come from `tailwind.config.js`. Tailwind generates them at build time.
- **Color values** for JavaScript props (e.g. `ActivityIndicator color={}`, shadow `shadowColor`) come from `constants/theme.ts`.
- **Font families** cannot be expressed as Tailwind classes in React Native — Tailwind has no concept of custom font families. Every text element needs `style={{ fontFamily: fonts.bold }}` alongside `className` for everything else. This is the correct pattern; it's not a workaround.
- **Shadows** are defined once in `theme.ts` as `shadows.card` and applied via `style={shadows.card}` on card views. iOS uses `shadowColor/shadowOpacity/shadowRadius/shadowOffset`; Android uses `elevation`. Both must be present for cross-platform consistency.
- **Fonts must load before the app renders.** The `useFonts` hook in `app/_layout.tsx` blocks rendering (returns `null`) until all five Manrope weights are ready. Without this, text would briefly flash with the system default font.

### Decision 7: Verified orgs — trust gate at the account level, not the opportunity level

When an org signs up, a `verified` boolean on their profile row defaults to `false`. Their opportunities are created immediately but are invisible to students until the boolean is flipped to `true` manually in Supabase.

This is a deliberate product decision: we don't require per-opportunity approval (which would slow down orgs and create a three-party coordination bottleneck) — we vet the org once, then trust everything they post. A guidance counselor asking "who's on this platform?" gets the same answer every time: only organizations we've personally confirmed.

The filtering happens client-side in `getOpportunities()`: we join `profiles.verified` and filter before returning. This avoids unreliable PostgREST join-column filter syntax (a pitfall encountered earlier with `opportunity_signups`).

### Decision 5: No school accounts in MVP — but the data is ready for them

School integration (Phase 3) requires counselors to log in, see their students, and track graduation requirements. That's a significant feature. We're not building it yet for two reasons: (1) it's as complex as everything we've built so far, and (2) it requires a go-to-market step — a school IT admin has to actually adopt the platform.

What we *are* doing is capturing everything Phase 3 will need: `school_name`, `graduation_year`, and a verified `hour_logs` row with `actual_date` and `service_description`. When the time comes, Phase 3 is an additive feature — it doesn't require rewriting existing data.

---

## File: `constants/theme.ts`

### Purpose
The single source of truth for every design decision in the app — colors, spacing, border radius, and typography.

### In Plain English
Every pixel decision in a well-built app should trace back to one place. Right now Greenie is green — but what if you wanted to change it to blue? Without a theme file, you'd have to find every `#16a34a` in every file. With this file, you change one value and everything that imports from it updates automatically. The `tailwind.config.js` brand aliases mirror the colors here for Tailwind class names; everything else (like `ActivityIndicator`) uses the values directly.

### How It Works
Four exported objects: `colors`, `spacing`, `borderRadius`, and `typography`. Each groups related values under meaningful names. Components import what they need.

### Key Code
```ts
export const colors = {
  brand: {
    default: '#16a34a', // bg-brand, text-brand in Tailwind
    muted:   '#f0fdf4', // bg-brand-muted
    dark:    '#15803d', // text-brand-dark
  },
  neutral: { ... },
  error: '#ef4444',
};
```
The `brand` object holds all variants of the primary color. When restyling, these four values plus the matching entries in `tailwind.config.js` are all that needs to change.

### What I Should Remember
- This file + `tailwind.config.js` are the only two files to edit for a full visual restyle.
- Tailwind `className` values (like `text-brand`) come from `tailwind.config.js`.
- JavaScript values that can't be expressed as class names (like `ActivityIndicator color`) come from this file.
- `spacing`, `borderRadius`, and `typography` give consistent names to numbers so you're never guessing "should this be 16 or 24?"

---

## File: `components/ui/Button.tsx`

### Purpose
A reusable button component so every button in the app looks and behaves consistently.

### In Plain English
Before this component existed, every screen had its own `TouchableOpacity` + `Text` combination with hardcoded colors and padding. If you wanted to change the button style, you'd edit every screen. Now every button imports `Button` from here. Change this one file and every button in the app updates. It supports two variants: `primary` (green, for main actions) and `danger` (red text, for destructive actions like sign out).

### Key Code
```tsx
<Button
  label="Sign in"
  loadingLabel="Signing in…"
  onPress={handleSignIn}
  loading={loading}
/>
```
- `label` — the text shown normally.
- `loadingLabel` — the text shown while the async action is in progress.
- `loading` — disables the button and shows `loadingLabel` while true.
- `variant="danger"` — renders as plain red text instead of a filled button.

### What I Should Remember
- All buttons in the app use this component — changing it changes everything.
- `disabled || loading` prevents double-submits.
- `variant="danger"` is for destructive or secondary actions.
- The button's visual style (color, radius, padding) is defined entirely here — screens never set button styling.

---

## File: `components/ui/Input.tsx`

### Purpose
A reusable text input so every form field in the app has consistent borders, padding, and text size.

### In Plain English
Same idea as `Button` — one component, used everywhere, easy to restyle. It wraps React Native's `TextInput` with the project's standard border, rounding, and padding baked in. Screens just pass `placeholder`, `value`, and `onChangeText`.

### Key Code
```tsx
<Input
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  autoCapitalize="none"
  keyboardType="email-address"
/>
```
The `...props` spread at the end passes through any extra TextInput props (like `secureTextEntry`, `keyboardType`) without the component needing to declare them all explicitly.

### What I Should Remember
- All form fields use this component — border, radius, and padding are defined here once.
- `placeholderTextColor` is set here globally so it doesn't need to be repeated on every input.
- The `extends Pick<TextInputProps, ...>` in the interface means TypeScript knows which TextInput props are valid here.

---

## File: `tailwind.config.js`

### Purpose
Tells Tailwind CSS which files to scan and defines custom design tokens like `brand` colors.

### In Plain English
Tailwind ships with colors like `green-600`. We've added our own alias called `brand` so components write `text-brand` instead of `text-green-600`. This is the Tailwind half of the theming system — `className` values like `bg-brand` resolve here. The actual hex values must match `constants/theme.ts`.

### Key Code
```js
colors: {
  brand: {
    DEFAULT: '#16a34a', // text-brand, bg-brand
    muted:   '#f0fdf4', // bg-brand-muted
    dark:    '#15803d', // text-brand-dark
    border:  '#bbf7d0', // border-brand
  },
},
```
`DEFAULT` is a Tailwind convention — it's the value used when you write `text-brand` (no suffix). Suffixes like `-muted` and `-dark` give you `text-brand-muted`, `bg-brand-dark`, etc.

### What I Should Remember
- `tailwind.config.js` + `constants/theme.ts` are the two files to update when restyling.
- The `brand` hex values here must match the `colors.brand` values in `theme.ts`.
- `content` tells Tailwind which files to scan — if you add a new folder with components, add it here.

---

## File: `types/opportunity.ts`

### Purpose
Defines the shape of opportunity and signup data so TypeScript can catch mistakes across the app.

### In Plain English
Same idea as `types/auth.ts` — these are contracts that describe what data looks like. `Opportunity` mirrors the columns in the `opportunities` database table. The `profiles?` field (with the `?` meaning optional) is a joined object — when we fetch an opportunity, we also ask Supabase to include the organization's name from the `profiles` table.

### Key Code
```ts
profiles?: { full_name: string };
```
The `?` means this field might not be present. When we query `opportunities` with `.select('*, profiles(full_name)')`, Supabase joins the related profile row and nests it here. If the join fails or isn't requested, this field is simply absent.

### What I Should Remember
- Types mirror database table columns exactly.
- The `profiles?` nested field comes from a Supabase join, not a separate query.
- `?` on a field means it's optional — TypeScript won't complain if it's missing.
- `profiles.verified` is included in the type so `getOpportunities` can filter by it client-side before returning data to screens.

---

## File: `services/opportunities.ts`

### Purpose
All database operations related to opportunities — fetching, creating, deleting, signing up, and checking what a student has already signed up for.

### In Plain English
Same pattern as `services/auth.ts`. Screens never touch Supabase directly — they call these functions. The file now has two distinct sets of functions: student-facing (read-only, filtered to verified orgs) and org-facing (read/write, unfiltered for the org's own data).

### Key Code
```ts
// Student-facing: only show verified orgs
export async function getOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name, verified)')
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).filter((opp: any) => opp.profiles?.verified === true);
}
```
We join `profiles.verified` and filter client-side. PostgREST join-column filters (`.eq('profiles.verified', true)`) are unreliable — filtering in JavaScript after the fetch is safer for MVP scale.

```ts
// Org-facing: all their own opportunities, verified or not
export async function getOrgOpportunities(orgId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name, verified)')
    .eq('org_id', orgId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
```
Orgs see their own opportunities regardless of verification status — otherwise they'd have no way to confirm their post went through.

```ts
export async function createOpportunity(orgId, fields): Promise<void> {
  const { error } = await supabase
    .from('opportunities')
    .insert({ org_id: orgId, ...fields });
  if (error) throw error;
}
```
The `org_id` is always the authenticated user's profile ID, enforced by the RLS INSERT policy (`WITH CHECK (org_id = auth.uid())`). The client can't spoof a different org.

### What I Should Remember
- Student-facing `getOpportunities` filters by `profiles.verified === true` client-side — unverified orgs are invisible to students.
- Org-facing `getOrgOpportunities` fetches by `org_id` — orgs always see their own regardless of verification.
- `createOpportunity` and `deleteOpportunity` are protected by RLS policies — orgs can only touch their own rows.
- `getStudentSignups` returns an array of opportunity IDs so the detail screen can check membership with `.includes()`.

---

## File: `components/SwipeCard.tsx`

### Purpose
A reusable wrapper that makes any content swipeable — tracking the finger, animating the card, and calling a callback when the swipe is complete.

### In Plain English
Think of this as a picture frame that you can grab and fling. The frame doesn't care what's inside it — it just handles the physics. When you press down, it starts tracking your finger. As you drag, the card moves and rotates to follow. When you let go, it either snaps back (if you didn't drag far enough) or flies off screen in the direction you were dragging. After it flies off, it calls `onSwipeLeft` or `onSwipeRight` so the parent can advance to the next card.

### How It Works
1. `PanResponder` is React Native's built-in gesture system. It fires events when a finger presses down, moves, and lifts.
2. `Animated.ValueXY` stores the card's current x and y position as animated values. Connecting them to the card's `transform` style makes it move in real time.
3. On release, the `dx` value (how far horizontally the finger moved) is checked against a threshold (25% of screen width). Past the threshold = swipe; under it = snap back.
4. `rotate` is derived from `position.x` using `interpolate` — as the card moves right, it tilts clockwise; left tilts it counterclockwise.

### Key Code
```ts
const position = useRef(new Animated.ValueXY()).current;
```
`Animated.ValueXY` holds an `{x, y}` pair that can be animated. `useRef` keeps the same object across re-renders without causing re-renders when it changes.

```ts
onPanResponderMove: (_, gesture) => {
  position.setValue({ x: gesture.dx, y: gesture.dy });
},
```
Every time the finger moves, `gesture.dx` and `gesture.dy` tell us how far it's moved from where it started. We set the card's position to match instantly.

```ts
const rotate = position.x.interpolate({
  inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
  outputRange: ['-15deg', '0deg', '15deg'],
});
```
`interpolate` maps one range of values to another. When `position.x` is 0 (center), rotation is 0°. When it reaches the screen edge, rotation is ±15°. Values between are calculated automatically.

```ts
Animated.timing(position, {
  toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
  duration: 250,
  useNativeDriver: true,
}).start(() => {
  position.setValue({ x: 0, y: 0 });
  onSwipeRight();
});
```
`Animated.timing` moves a value to a target over a set duration. `useNativeDriver: true` runs the animation on the native thread (smooth, no JavaScript lag). The `.start()` callback fires when the animation finishes — here we reset position and notify the parent.

### What I Should Remember
- `PanResponder` handles touch tracking; `Animated.ValueXY` handles the visual movement.
- `interpolate` lets you derive one animated value from another (rotation from position, badge opacity from position).
- `useNativeDriver: true` is always preferred — it runs animations on the GPU, not in JavaScript.
- This component is generic — it has no knowledge of opportunities. It just moves and calls callbacks.
- `key={currentIndex}` in the parent is critical — it forces React to recreate this component for each new card, resetting all gesture state.
- The "join" and "skip" badge overlays are derived entirely from `position.x` via `interpolate` — no new state. They're `position: 'absolute'` views rendered after `{children}` so they stack on top naturally.

---

## File: `components/OpportunityCard.tsx`

### Purpose
The visual content of each swipe card — title, organization name, description, date, location, and hours.

### In Plain English
This component just displays information. It has no logic, no state, no gestures — it receives an `opportunity` object and renders it. It lives inside a `SwipeCard` wrapper which provides all the gesture behavior. Separating them means you can redesign the card's appearance without touching the swipe logic, and vice versa.

### Key Code
```ts
const date = new Date(opportunity.date).toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
});
```
Converts a raw date string from the database (like `"2026-08-02"`) into a readable format like `"Saturday, August 2"`.

### What I Should Remember
- This component is purely presentational — no state, no effects, no logic.
- It receives an `Opportunity` object as a prop and renders its fields.
- The swipe behavior comes from `SwipeCard`, not this component.

---

## File: `app/(student)/discover.tsx`

### Purpose
The main student screen — loads a stack of opportunities and lets the student swipe through them.

### In Plain English
This screen does the work of connecting data to UI. It fetches all opportunities from the database when it first loads, then renders them as a stack of swipe cards. The current card is on top; the next card is visible behind it at a smaller size to hint there's more to come. Swiping right signs the student up and advances to the next card; swiping left just advances; tapping opens the detail screen.

### How It Works
1. `useEffect` fetches all opportunities once when the screen loads.
2. `currentIndex` tracks which card is on top. Swiping advances the index.
3. `SwipeCard` wraps `OpportunityCard` for each card. `key={currentIndex}` resets the swipe component for each new card.
4. When `currentIndex >= opportunities.length`, there are no more cards — show a "you're all caught up" message.

### Key Code
```tsx
{opportunities[currentIndex + 1] && (
  <View className="absolute opacity-60 scale-95">
    <OpportunityCard opportunity={opportunities[currentIndex + 1]} />
  </View>
)}
```
Renders the *next* card behind the current one, slightly smaller and faded. `absolute` positioning stacks it directly behind. This creates the visual effect of a deck of cards.

```tsx
<SwipeCard
  key={currentIndex}
  onSwipeLeft={handleSwipeLeft}
  onSwipeRight={handleSwipeRight}
  onTap={handleTap}
>
  <OpportunityCard opportunity={opportunities[currentIndex]} />
</SwipeCard>
```
`key={currentIndex}` is the critical detail — React uses `key` to identify components. When `key` changes, React destroys the old component and creates a new one. This resets `SwipeCard`'s internal gesture state for each new card.

### What I Should Remember
- `useEffect` with `[]` fetches data once on mount.
- `currentIndex` is the only state that drives the whole screen — advancing it changes the card shown.
- `key={currentIndex}` is required to reset the swipe component for each card.
- The "next card behind" effect is just an absolutely positioned component with reduced opacity and scale.

---

## File: `app/(student)/opportunity/[id].tsx`

### Purpose
The detail screen for a single opportunity — full description, date, location, hours, and a sign-up button.

### In Plain English
This screen is reached by tapping a card on the discover screen. The `[id]` in the filename is a dynamic segment — Expo Router replaces it with the actual opportunity ID when navigating. The screen loads that specific opportunity and also checks whether the student has already signed up. If they have, it shows a "You're signed up" confirmation instead of a button.

### Key Code
```ts
const { id } = useLocalSearchParams<{ id: string }>();
```
`useLocalSearchParams` reads the dynamic segment from the URL. If the route is `/opportunity/abc-123`, then `id` will be `"abc-123"`.

```ts
const [opp, signups] = await Promise.all([
  getOpportunity(id),
  getStudentSignups(profile.id),
]);
```
`Promise.all` runs two async operations at the same time and waits for both to finish. This is faster than running them one after the other.

### What I Should Remember
- `[id]` in a filename creates a dynamic route — Expo Router passes the value via `useLocalSearchParams`.
- `Promise.all` runs multiple async calls in parallel — always prefer this over sequential `await` when the calls don't depend on each other.
- The screen checks existing signups on load so the button state is accurate before the user interacts.
- `router.back()` navigates to the previous screen, just like a back button.

---

## File: `index.ts`

### Purpose
Tells the JavaScript bundler where the app starts.

### In Plain English
Think of this file as a front door with a sign that says "go to the main entrance." It does nothing itself — it just points to Expo Router's built-in entry point, which is the real place the app boots from. The reason this file exists at all is that Metro (the bundler that packages our code for the phone) looks for a file called `index.ts` in the root folder. Without it, the app wouldn't know where to begin.

### How It Works
One line. It imports `expo-router/entry`, which triggers Expo Router to scan the `app/` folder and set up all the routes.

### Key Code
```ts
import 'expo-router/entry';
```
This import has a side effect: it starts Expo Router. When JavaScript sees `import 'something'`, it runs that module's code even if you don't use any of its exports.

### What I Should Remember
- This file exists because Metro needs a root entry point.
- It doesn't render anything — it just starts the routing system.
- `expo-router/entry` is what actually launches the app.
- Without this file, the app would crash before showing anything.

---

## File: `babel.config.js`

### Purpose
Configures Babel, the tool that translates our modern TypeScript/JSX code into JavaScript that React Native can run.

### In Plain English
Our code uses features like TypeScript, JSX (the HTML-like syntax inside `.tsx` files), and NativeWind's `className` prop. Phone browsers can't run that directly — they need plain JavaScript. Babel is the translator. This config file tells Babel which translation rules to apply.

### How It Works
It exports a function that returns a list of "presets" — preset = a bundle of translation rules. We use one preset: `babel-preset-expo`, with two options passed to it.

### Key Code
```js
['babel-preset-expo', { jsxImportSource: 'nativewind', reanimated: false }]
```
- `babel-preset-expo` — Expo's official set of translation rules. Handles TypeScript, JSX, and more.
- `jsxImportSource: 'nativewind'` — tells Babel that when it sees `className="..."` on a component, it should route that through NativeWind's engine instead of the default React engine.
- `reanimated: false` — stops Babel from auto-loading the Reanimated animation plugin, which requires a separate package (`react-native-worklets`) we don't actively use but need installed for NativeWind.

### What I Should Remember
- Babel translates our code so phones can run it.
- `jsxImportSource: 'nativewind'` is what makes `className` work on React Native components.
- `reanimated: false` is a workaround — without it, Babel auto-detects Reanimated and tries to load a plugin that breaks the build.
- This file runs at build time, not at runtime on the phone.

---

## File: `metro.config.js`

### Purpose
Configures Metro, the tool that bundles all our JavaScript files into one package for the phone.

### In Plain English
When you run `npx expo start`, Metro reads every file in the project, follows all the `import` statements, and bundles everything into a single package it serves to the phone over WiFi. Think of it as a packer that puts all your code into one box. This config file tells Metro to also process CSS files (which NativeWind needs).

### How It Works
Starts with Expo's default Metro config, then wraps it with `withNativeWind` which teaches Metro to find and process `global.css`.

### Key Code
```js
module.exports = withNativeWind(config, { input: './global.css' });
```
`withNativeWind` adds a step to Metro's pipeline: before bundling, it reads `global.css`, runs it through Tailwind CSS to generate style data, and bakes that into the bundle.

### What I Should Remember
- Metro bundles all JavaScript files into one package for the phone.
- `withNativeWind` is what connects our CSS file to the bundler.
- Without this, NativeWind's `className` styling would not work.
- Changes to this file require restarting Metro with `--clear`.

---

## File: `global.css`

### Purpose
The CSS file that activates all of Tailwind's utility classes for NativeWind.

### In Plain English
Tailwind CSS works by scanning your code for class names like `text-green-600` or `flex-1` and generating the matching styles. But it needs a starting point — a CSS file that says "load the Tailwind system." This three-line file is that starting point. NativeWind reads it, generates the styles, and makes them available to every component via `className`.

### Key Code
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
These three directives tell Tailwind to load its base reset, component styles, and the full library of utility classes (like `text-green-600`, `px-4`, `rounded-lg`).

### What I Should Remember
- This file activates Tailwind's class library for the whole app.
- It's imported in `app/_layout.tsx` so it loads once when the app starts.
- You never write custom CSS here — all styling happens via `className` on components.
- Metro processes this file at build time, not at runtime.

---

## File: `tailwind.config.js`

### Purpose
Tells Tailwind CSS which files to scan for class names, and loads the NativeWind preset.

### In Plain English
Tailwind only generates CSS for the classes you actually use. To know which classes you use, it scans your source files. This config tells it where to look (`app/` and `components/`). It also loads the NativeWind preset, which teaches Tailwind to generate styles that work in React Native (not just in web browsers).

### Key Code
```js
content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
presets: [require('nativewind/preset')],
```
- `content` — the list of files Tailwind scans. `**` means "any subfolder."
- `nativewind/preset` — adjusts Tailwind so its output works on mobile (e.g. `flex` defaults differ between web and React Native).

### What I Should Remember
- Tailwind only includes classes that appear in files listed under `content`.
- If you add a new folder with components, add it here or the styles won't work.
- The NativeWind preset is required — without it, many classes would produce wrong results on mobile.

---

## File: `lib/supabase.ts`

### Purpose
Creates and exports the single Supabase client that the rest of the app uses to talk to the database and authentication system.

### In Plain English
Supabase is our backend — it holds all the data (users, profiles, opportunities) and handles login/logout. To talk to Supabase from the app, you need a "client" — an object that knows the address of your database and has the right credentials. This file creates that client once and shares it with the rest of the app. Think of it as programming a phone with one contact saved: "Supabase — here's the number, here's the password."

### How It Works
1. Reads the Supabase URL and key from environment variables (so real credentials are never hardcoded).
2. Creates the client with `createClient`, telling it to save sessions to AsyncStorage (so the user stays logged in after closing the app).
3. Adds a listener for when the app comes back to the foreground — when it does, it refreshes the auth token so the session doesn't expire silently.

### Key Code
```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```
- `storage: AsyncStorage` — stores the login session on the phone's local storage, not in memory. Memory is wiped when the app closes; AsyncStorage survives.
- `persistSession: true` — re-uses the stored session when the app reopens.
- `detectSessionInUrl: false` — web apps use the URL to pass session tokens. Mobile apps don't have URLs, so we turn this off.

```ts
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
```
Auth tokens expire after an hour. `autoRefresh` silently gets a new token in the background. We only run it when the app is on screen — pausing it when the app is in the background saves battery.

### What I Should Remember
- There is one Supabase client for the whole app, created here and imported everywhere else.
- Credentials come from `.env` (never hardcoded), prefixed with `EXPO_PUBLIC_` so Expo can read them.
- Sessions are saved to the phone so users don't have to log in every time.
- The `AppState` listener keeps the auth token fresh when the app is open.

---

## File: `app/_layout.tsx`

### Purpose
The root layout that wraps every screen in the app and starts the authentication system on launch.

### In Plain English
In Expo Router, every `_layout.tsx` file defines a shell that wraps the screens inside its folder. The root layout (this file) wraps the entire app. It does two things: (1) imports the CSS file so NativeWind is active everywhere, and (2) calls `initialize()` when the app first opens, which checks if the user is already logged in.

### How It Works
The `useEffect` with an empty array (`[]`) runs once — immediately after the component appears on screen. At that moment it calls `initialize()` from the auth store, which checks for a saved session. The `<Stack />` component renders whichever screen the router navigated to.

### Key Code
```tsx
useEffect(() => {
  initialize();
}, []);
```
`useEffect(() => { ... }, [])` means "run this code once, right after the component first renders." The empty array is the dependency list — no dependencies means it never re-runs. This is the standard React pattern for "do something on mount."

### What I Should Remember
- `_layout.tsx` wraps all screens in its folder and subfolders.
- The root layout is the best place to start the auth system — it runs before any screen is shown.
- `useEffect` with `[]` = "run once on startup."
- `<Stack />` is the navigation container — it displays the current screen as a stack of pages.

---

## File: `app/index.tsx`

### Purpose
The routing gate — the first screen the app shows, which immediately redirects the user to the right place based on whether they're logged in and what type of account they have.

### In Plain English
This screen never shows real content. Its only job is to look at the user's current state and send them somewhere else. If the app is still loading (checking for a saved session), it shows a spinning indicator. Once it knows the answer, it redirects: no session → sign-in screen; student account → student dashboard; org account → org dashboard. Think of it as a traffic cop at the entrance of the app.

### How It Works
1. Reads three values from the auth store: `session`, `profile`, and `initialized`.
2. If `initialized` is false, the auth check is still running — show a spinner.
3. If `initialized` is true and there's no `session` → go to sign-in.
4. If there's a session and the profile says `student` → go to the student dashboard.
5. Otherwise → go to the org dashboard.

### Key Code
```tsx
if (!initialized) {
  return <View ...><ActivityIndicator color="#16a34a" /></View>;
}
if (!session) return <Redirect href="/(auth)/sign-in" />;
if (profile?.account_type === 'student') return <Redirect href="/(student)/dashboard" />;
return <Redirect href="/(org)/dashboard" />;
```
- `ActivityIndicator` — React Native's built-in spinning circle.
- `<Redirect>` — Expo Router component that navigates to a new screen without adding the current screen to history (so the user can't press "back" to return to the spinner).
- `profile?.account_type` — the `?` is "optional chaining": if `profile` is null, this evaluates to `undefined` instead of crashing.

### What I Should Remember
- This file is the single decision point for routing in the app.
- It never shows real UI — only a spinner or a redirect.
- `initialized` prevents a premature redirect before the session check completes.
- `<Redirect>` replaces the current screen in history; the user can't go back to it.
- Unauthenticated users land on `/(auth)/welcome` (not sign-in directly) — new users see the onboarding screen; returning users tap "sign in" from there.

---

## File: `types/auth.ts`

### Purpose
Defines the shape of authentication-related data so TypeScript can catch mistakes before the app runs.

### In Plain English
TypeScript lets you describe exactly what a piece of data looks like. If you try to use a field that doesn't exist, TypeScript will warn you before you even run the app. This file describes two things: `AccountType` (which can only be `'student'` or `'org'`) and `Profile` (what a user profile row from the database looks like). Every file that works with profiles imports these types.

### Key Code
```ts
export type AccountType = 'student' | 'org';
```
This is a "union type" — `AccountType` can be one of these two string values and nothing else. If you accidentally write `'teacher'`, TypeScript will catch it immediately.

```ts
export interface Profile {
  id: string;
  account_type: AccountType;
  full_name: string;
  created_at: string;
}
```
An `interface` describes the shape of an object. This says: every Profile must have these four fields, with these types. This mirrors the columns in our `profiles` database table.

### What I Should Remember
- Types live in `types/` and are shared across the whole app.
- `AccountType` being a union type means TypeScript will error if you use any other string.
- The `Profile` interface must match the `profiles` table columns in the database.
- Types only exist at compile time — they disappear from the final app bundle.

---

## File: `services/auth.ts`

### Purpose
The only place in the app that talks to Supabase for authentication and profile data.

### In Plain English
This is the data layer for auth. Screens never call Supabase directly — they call functions from this file. This separation has a practical benefit: if Supabase changes their API, you fix it here in one place instead of hunting through every screen. Think of it as a contractor: screens tell the contractor what they need, and the contractor handles the messy details of getting it.

### How It Works
Four exported functions:
- `signUp` — creates an auth account AND immediately creates a profile row in the database. Both must succeed.
- `signIn` — authenticates with email and password, returns the user.
- `signOut` — clears the session.
- `getProfile` — fetches a profile row from the database by user ID.

### Key Code
```ts
export async function signUp(email, password, fullName, accountType) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    account_type: accountType,
    full_name: fullName,
  });
  if (profileError) throw profileError;
}
```
Sign-up is two steps: create the auth account, then insert the profile. If either step fails, we `throw` the error — this stops execution and jumps to the `catch` block in the screen that called this function.

```ts
export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}
```
`.from('profiles')` — which table. `.select('*')` — all columns. `.eq('id', userId)` — where id equals this value. `.single()` — return one object, not an array.

### What I Should Remember
- Screens call these functions; they never import `supabase` directly.
- `async/await` means these functions pause and wait for the network response before continuing.
- `throw error` passes the error up to whoever called this function.
- `signUp` does two database operations — if the second one fails, the auth account still exists (orphaned). This is a known limitation for MVP.

---

## File: `stores/useAuthStore.ts`

### Purpose
The global container that holds the current user's session and profile, and makes that data available to any component in the app.

### In Plain English
Imagine a whiteboard in the middle of the office that anyone can read or write on. The auth store is that whiteboard for login state. When a user signs in, we write their session and profile to the store. Any screen that wants to know "is someone logged in, and who?" reads from the store. Without this, every screen would have to check independently — and they'd all get out of sync with each other.

### How It Works
`create()` from Zustand takes a function and returns a React hook (`useAuthStore`). Inside, we define:
- **State**: `session`, `profile`, `initialized` — the data we're tracking.
- **Setters**: `setSession`, `setProfile` — functions to update that data.
- **`initialize()`** — the startup function that checks for a saved session and sets up a listener for future auth changes.

### Key Code
```ts
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  initialize: async () => { ... }
}));
```
`set({ session })` is how you update Zustand state. Every component using this store will automatically re-render with the new value — similar to `useState` but shared across the entire app.

```ts
supabase.auth.onAuthStateChange(async (_event, session) => {
  // update store whenever auth state changes
  set({ session, profile });
});
```
This listener fires automatically whenever Supabase detects a login or logout — even if it was triggered from a different screen. This keeps the store in sync without any extra work.

### What I Should Remember
- Zustand is like `useState` but shared across every component in the app.
- `initialized` starts as `false` and becomes `true` only after the startup session check completes.
- `onAuthStateChange` is a Supabase listener that fires automatically on login/logout.
- Any component can call `useAuthStore()` and get the current session — no props needed.

---

## File: `components/Confetti.tsx`

### Purpose
A self-contained celebration component that bursts 38 pastel particles across the screen and finishes in about 1–1.5 seconds.

### In Plain English
When the student submits hours, they deserve a moment of delight. This component renders a burst of small colored rectangles — pastels, not brand colors, so it feels fun rather than branded — that fall, drift sideways, spin, and fade. It mounts once, plays the animation, and then all particles are invisible. The screen underneath is fully interactive the whole time (`pointerEvents="none"` on the container).

The color choice is intentional: using the same green and gold as the rest of the app would make confetti feel like a UI element. Using soft pinks, yellows, blues, peaches, and mint makes it feel like a real celebration.

### How It Works
1. On mount, `makeParticle()` creates 38 particles, each with its own random starting position, size, color, drift direction, and spin target.
2. `useRef` stores the particle array so it's only created once (not recreated on every render).
3. `useEffect` kicks off an `Animated.sequence` for each particle: a brief delay (0–150ms, creating the "burst" effect), then parallel animations for y position (fall), x position (drift), rotation, and opacity (fade in then out).
4. The component positions itself over the whole screen with `StyleSheet.absoluteFill` and ignores all touches.

### Key Code
```tsx
// opacity sequence total = 60ms + (dur*0.5 - 60ms) + dur*0.5 = dur
// This matches the movement duration exactly so all animations end together
Animated.sequence([
  Animated.timing(p.opacity, { toValue: 1, duration: 60, useNativeDriver: true }),
  Animated.delay(dur * 0.5 - 60),
  Animated.timing(p.opacity, { toValue: 0, duration: dur * 0.5, useNativeDriver: true }),
]),
```
The math ensures the opacity animation finishes at the exact same time as the fall — so particles don't linger invisible or disappear early.

### What I Should Remember
- `pointerEvents="none"` — the confetti is a visual layer only; the screen beneath stays interactive.
- `useRef` for the particle array — ensures particles aren't recreated on re-renders.
- `useNativeDriver: true` for all transforms and opacity — runs on the GPU, no JavaScript lag.
- Delay window of 0–150ms creates a "burst" feel rather than a slow cascade.
- Pastel colors are deliberate — warm and fun, not brand-colored.

---

## File: `components/ui/XPBar.tsx`

### Purpose
A reusable gold progress bar that shows a student's XP progress within their current level, with an animated fill on mount.

### In Plain English
The XP system gives 100 XP per level. This component takes the student's total `xp` and `level`, figures out how far they are through the current level, and draws a gold bar that animates from empty to the correct fill when it first appears. The left label shows total XP; the right label says "next level in N xp."

The bar animates rather than appearing instantly because it makes the gamification feel alive — you see the progress you've earned, not just a static number.

### How It Works
1. The container View gets an `onLayout` callback that fires once, reporting the actual pixel width of the bar track.
2. `useEffect` watches for that width. Once it arrives, `Animated.timing` animates `widthAnim` from 0 to `containerWidth × (progressPercent / 100)` pixels over 900ms.
3. `useNativeDriver: false` is required because `width` is a layout property — only `transform` and `opacity` can use the native driver.

### Key Code
```tsx
const widthAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (containerWidth === 0) return;
  Animated.timing(widthAnim, {
    toValue:  containerWidth * (progressPercent / 100),
    duration: 900,
    delay:    150,
    easing:   Easing.out(Easing.cubic),
    useNativeDriver: false,
  }).start();
}, [containerWidth]);
```
The `onLayout` → `useEffect` pattern is the standard React Native way to animate to a percentage width — percentages alone can't be animated directly.

### What I Should Remember
- `xp % 100` works because each level is exactly 100 XP wide.
- Percentage widths can't be animated — measure the container first, then animate in pixels.
- `useNativeDriver: false` for width animations (layout properties can't run on the native thread).
- `Math.min(..., 100)` prevents the bar from overflowing if XP gets ahead of the display.

---

## File: `app/(auth)/_layout.tsx`, `app/(student)/_layout.tsx`, `app/(org)/_layout.tsx`

### Purpose
Define navigation containers for each group of screens.

### In Plain English
Expo Router uses "route groups" — folders with parentheses in the name, like `(auth)`. The folder name is invisible to navigation (the URL is `/sign-in`, not `/(auth)/sign-in`). The `_layout.tsx` inside each group defines how screens in that group are wrapped.

`(auth)` and `(org)` use `<Stack screenOptions={{ headerShown: false }} />` — a stack navigator with no visible header bar.

`(student)` uses `<Tabs>` — a tab bar at the bottom with two tabs: Discover (compass icon) and Profile (person-circle icon). The `opportunity/[id]` and `log-hours/[opportunityId]` routes are declared with `href: null` so they're navigable but invisible in the tab bar.

### Key Code
```tsx
<Tabs.Screen name="opportunity/[id]" options={{ href: null }} />
```
`href: null` tells Expo Router: this route exists and can be navigated to, but don't show it as a tab button. Without this declaration, the tab bar would either show a mysterious extra tab or throw a routing error.

### What I Should Remember
- Folders named `(like-this)` are route groups — they group screens without affecting the URL.
- `_layout.tsx` must exist in every route group.
- `headerShown: false` hides the default navigation bar.
- `href: null` hides a route from the tab bar while keeping it navigable — required for any screen inside a Tabs layout that should be accessed via navigation, not a tab tap.

---

## File: `app/(auth)/sign-in.tsx`

### Purpose
The sign-in screen where returning users enter their email and password.

### In Plain English
This is the first screen most users will see. It shows two text fields (email and password) and a button. When the user taps "Sign in," the app sends their credentials to Supabase, waits for a response, fetches their profile, saves everything to the auth store, and navigates to their dashboard. If anything goes wrong, the error message appears in red below the form.

### How It Works
1. Four pieces of local state: `email`, `password`, `error`, `loading`.
2. `handleSignIn` is called when the button is pressed. It calls `signIn()`, then `getProfile()`, saves both to the store, then navigates.
3. `KeyboardAvoidingView` makes the form slide up when the keyboard appears, so fields aren't hidden behind it.

### Key Code
```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```
`useState` creates a value and a function to update it. When the update function is called, the component re-renders with the new value.

```tsx
<TextInput
  value={email}
  onChangeText={setEmail}
  autoCapitalize="none"
  keyboardType="email-address"
/>
```
`value={email}` ties the input to the state variable. `onChangeText={setEmail}` updates the state every time the user types a character. This is called a "controlled input."

```tsx
router.replace('/(student)/dashboard');
```
`replace` navigates to a new screen but removes the current one from the navigation stack. This means the user can't press "back" to return to the sign-in screen after logging in.

### What I Should Remember
- `useState` for each input field is the standard React pattern for forms.
- `loading` state prevents double-submits by disabling the button while the request is in flight.
- `router.replace` vs `router.push`: replace removes the current screen from history; push keeps it.
- `KeyboardAvoidingView` with `behavior="padding"` on iOS is required to prevent the keyboard from covering inputs.

---

## File: `app/(auth)/sign-up-student.tsx`

### Purpose
The sign-up screen for new student accounts.

### In Plain English
Same structure as sign-in, but with an extra field for full name and calls `signUp()` instead. It passes `'student'` as the account type, which gets saved to the `profiles` table. After sign-up succeeds, the user is already logged in and gets sent to the student dashboard.

### What I Should Remember
- Sign-up calls two Supabase operations: create auth account, then insert profile.
- The account type `'student'` is hardcoded here; org sign-up hardcodes `'org'`.
- `fullName.trim()` removes leading/trailing spaces from the input before saving.

---

## File: `app/(student)/dashboard.tsx`

### Purpose
The student's home base — shows their current level, XP progress, total verified hours, and a list of every opportunity they've signed up for with the status of their hour log for each.

### In Plain English
This is where the gamification comes alive. At the top, a large "Level N" display shows where the student stands, with an XP progress bar showing how far they are toward the next level. Below that, every signed-up opportunity is listed. Each shows one of four states: a "Log hours" button (not yet submitted), "Pending verification" (submitted and waiting), a green "Verified" confirmation with the XP earned, or a red "Rejected" notice.

The dashboard refreshes the profile from the database every time it loads. This is important because XP is awarded by a database trigger — the Zustand store might have a stale XP value from when the user last authenticated. By fetching a fresh profile on mount, the student always sees their actual XP.

### How It Works
1. On mount, three parallel calls: `getProfile` (fresh XP/level), `getSignedUpOpportunities` (their list), `getStudentHourLogs` (their submissions).
2. Hour logs are stored in a `logMap` — a dictionary keyed by `opportunity_id`. This makes it instant to look up whether a specific opportunity has been logged.
3. For each opportunity in the list, check `logMap[opp.id]` to determine which status UI to render.

### Key Code
```ts
const map: Record<string, HourLog> = {};
for (const log of logs) map[log.opportunity_id] = log;
setLogMap(map);
```
Instead of calling `.find()` on the logs array for every opportunity (which is slow for large lists), we build a dictionary once. Looking up `logMap[opportunityId]` is instant.

```ts
const xpIntoLevel = xp % 100;
const progressPercent = Math.round((xpIntoLevel / 100) * 100);
```
`xp % 100` gives the remainder when dividing by 100 — the XP earned within the current level. If the student has 250 XP (Level 3), then `250 % 100 = 50` — they're 50% through Level 3.

```tsx
<View className="h-2 bg-brand rounded-full" style={{ width: `${progressPercent}%` }} />
```
The progress bar uses an inline `style` for width because Tailwind can't express dynamic percentage widths as class names. This is one of the few legitimate uses of `style` prop.

### What I Should Remember
- Always refresh the profile on dashboard mount — the Zustand store may have stale XP from the last auth check.
- `logMap` is a dictionary for O(1) lookup, not an array you search through.
- `xp % 100` gives progress within the current level (works because each level is exactly 100 XP wide).
- The progress bar needs `style={{ width: '${n}%' }}` because dynamic values can't be Tailwind classes.

---

## File: `app/(org)/dashboard.tsx`

### Purpose
The organization's home screen — shows the count of pending hour submissions and links to the verification screen.

### In Plain English
Organizations have one primary job in Greenie: verify that students actually completed the service they claim. The dashboard makes this obvious by putting the pending count front and center. Tapping it goes to the verifications list. There's also a sign-out button at the bottom.

### What I Should Remember
- Two stat cards: pending verifications (→ verifications screen) and posted opportunities (→ opportunities management screen).
- Both counts are fetched in parallel with `Promise.all` on mount.
- Sign-out follows the same three-step pattern: call `signOut()`, clear the store, navigate to sign-in.

---

## File: `types/hours.ts`

### Purpose
Defines the shape of hour log data so TypeScript can catch mistakes across all files that work with hour submissions.

### In Plain English
Same role as `types/auth.ts` and `types/opportunity.ts` — a contract that describes what a database row looks like. The `HourLog` interface mirrors the columns in the `hour_logs` table, plus two optional nested objects (`opportunities` and `profiles`) that appear when the query uses joins to fetch related data.

### Key Code
```ts
opportunities?: {
  title: string;
  hours_value: number;
};
profiles?: {
  full_name: string;
  school_name: string | null;
};
```
The `?` makes these optional — they're not always present. `getStudentHourLogs` fetches opportunity data; `getOrgPendingLogs` fetches both opportunity AND student profile data. The same type handles both query shapes.

### What I Should Remember
- `HourLog.actual_date` is a string like `"2026-07-20"` (a date, not a timestamp).
- `HourLog.hours_logged` may come from Postgres as a string in some edge cases — always wrap with `Number(log.hours_logged)` before math.
- `profiles?` in this type refers to the *student's* profile (via the `student_id` FK) — not the org's profile.

---

## File: `services/hours.ts`

### Purpose
All database operations related to hour logs — submitting, fetching, verifying, and rejecting.

### In Plain English
Five functions that hide the Supabase query details from screens. Screens call `verifyHourLog(id)` — they don't know or care that this triggers an XP update in the database. That separation is intentional: if we ever change how XP is calculated, we change the database trigger, and no screen code needs to change.

### Key Code
```ts
export async function getOrgPendingLogs(orgId: string): Promise<HourLog[]> {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, opportunities!inner(title, hours_value, org_id), profiles(full_name, school_name)')
    .eq('opportunities.org_id', orgId)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });
```
`opportunities!inner` means: only return hour_logs that have a matching opportunity (an INNER JOIN). `.eq('opportunities.org_id', orgId)` filters to only opportunities owned by this org. `profiles(...)` joins the student's profile row via the `student_id` foreign key. Three tables, one query.

```ts
export async function verifyHourLog(logId: string): Promise<void> {
  const { error } = await supabase
    .from('hour_logs')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', logId);
```
The client just updates two columns. The Postgres trigger (`trigger_award_xp`) detects this status change and awards XP automatically. The client never knows or sends XP — the database handles it.

### What I Should Remember
- XP is awarded by a Postgres trigger when `status` changes to `'verified'`. The service function just updates the status — it doesn't know about XP at all.
- `getStudentHourLogs` joins opportunities (for the title). `getOrgPendingLogs` joins both opportunities AND the student's profile.
- `!inner` in a Supabase select makes it an INNER JOIN — rows without a matching related record are excluded.
- Filtering on a joined table uses dot notation: `.eq('opportunities.org_id', orgId)`.

---

## File: `app/(student)/log-hours/[opportunityId].tsx`

### Purpose
The form where a student submits their hours after completing an opportunity.

### In Plain English
After signing up for a beach cleanup and showing up, the student opens this screen to record what they actually did. They enter: how many hours they completed, what date the service happened, and an optional description of what they did. The description matters — schools and counselors read it to understand what the student actually contributed.

When submitted, a row is created in `hour_logs` with status `'pending'`. The student can't do anything else from here — they're done until the org verifies.

### Key Code
```tsx
const { opportunityId, title, hoursValue } = useLocalSearchParams<{
  opportunityId: string;
  title: string;
  hoursValue: string;
}>();
```
The `[opportunityId]` route segment provides the ID. `title` and `hoursValue` are passed as query parameters from the dashboard when navigating here — this avoids an extra database fetch just to show the opportunity title.

```ts
const today = new Date().toISOString().split('T')[0];
```
`new Date().toISOString()` gives something like `"2026-07-24T15:30:00.000Z"`. Splitting at `'T'` and taking index 0 gives `"2026-07-24"` — the YYYY-MM-DD format Postgres expects for a `date` column.

```ts
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { ... }
```
A simple regex validation. `\d{4}` means exactly 4 digits, `-` is a literal dash, `\d{2}` is exactly 2 digits. This catches obvious mistakes before making a network request.

### What I Should Remember
- `[opportunityId]` in the filename = dynamic route. The value is read with `useLocalSearchParams`.
- `title` and `hoursValue` come as query params (not route segments) — they're passed by the dashboard when navigating.
- The YYYY-MM-DD format is required by Postgres `date` columns — the regex ensures this before submitting.
- After submission, the screen shows a confirmation and the student navigates back to dashboard with `router.replace` (not `push`) so they can't go back to the form.

---

## File: `app/(org)/verifications.tsx`

### Purpose
The screen where organizations review pending hour submissions and either verify or reject them.

### In Plain English
This is the most consequential screen in the app — the moment an org taps "Verify," a Postgres trigger fires and XP is awarded to the student. The screen loads all pending logs for the org's opportunities, showing each student's name, school, the opportunity they're claiming, the hours and date, and their description of what they did.

Tapping Verify or Reject immediately removes the card from the list (optimistic update — assume success) and calls the service function. The list shrinks as the org works through it.

### How It Works
1. On mount, fetch all pending logs via `getOrgPendingLogs(profile.id)`.
2. Each card shows: student name + school, opportunity title, hours + formatted date, and description.
3. Verify/Reject buttons call service functions, then filter the log out of the local state array.
4. `actionLoading` tracks which specific log is being processed — only that card's buttons are disabled, not the whole list.

### Key Code
```ts
const [actionLoading, setActionLoading] = useState<string | null>(null);
```
Rather than a boolean `loading` that would disable every button, we store the ID of the log currently being acted on. This way the org can see that one card is processing while the rest remain interactive.

```ts
setLogs((prev) => prev.filter((l) => l.id !== logId));
```
Optimistic update — remove the card immediately when the action is triggered, without waiting for the network response. This feels instant. If the request fails (caught by the `catch`), the card stays gone — acceptable for MVP; a production version would restore it.

```ts
const dateStr = new Date(log.actual_date + 'T12:00:00').toLocaleDateString(...)
```
`actual_date` from Postgres is `"2026-07-20"` — a date with no time. Adding `T12:00:00` before parsing prevents timezone issues: midnight of a date can round to the previous day in some timezones. Noon never crosses a day boundary.

### What I Should Remember
- Verifying a log here triggers the database XP trigger — the org doesn't send XP, they just update status.
- `actionLoading` stores a log ID, not a boolean, so only one card is disabled at a time.
- Optimistic updates (remove card immediately) make the UI feel responsive. The tradeoff is that a failed network call leaves the card gone — acceptable for MVP.
- Date parsing: always append `T12:00:00` when converting a date-only string to a `Date` object to avoid timezone boundary bugs.

---

## File: `app/(auth)/welcome.tsx`

### Purpose
The onboarding screen that new users land on before signing up.

### In Plain English
Unauthenticated users used to go straight to sign-in. Now they land here first. The screen has one job: communicate what Greenie is ("doing good shouldn't be hard.") and route the user to the right sign-up flow. Students and orgs have separate sign-up screens, so this screen acts as the fork in the road. Returning users tap "sign in" at the bottom.

The wordmark is large and centered — the first thing a new user reads. The tagline is the emotional pitch. The buttons are at the bottom so the wordmark and tagline have room to breathe.

### What I Should Remember
- `app/index.tsx` redirects unauthenticated users here, not to sign-in.
- "i'm a student" → `/(auth)/sign-up-student`; "i'm an organization" → `/(auth)/sign-up-org`; sign-in link → `/(auth)/sign-in`.
- Layout uses `flex-1` for the wordmark area (expands to fill space) and a fixed-height button section at the bottom.

---

## File: `app/(org)/create-opportunity.tsx`

### Purpose
The form where an org posts a new volunteer opportunity.

### In Plain English
Five fields: title, description, location, date, and expected hours. The date field is plain text (`mm/dd/yyyy`) with a `parseDate()` helper that converts it to `yyyy-mm-dd` for Postgres. This avoids adding a date picker dependency while still being intuitive for US users. On submit, `createOpportunity()` inserts the row and the screen navigates back to the opportunities list.

### Key Code
```ts
function parseDate(input: string): string | null {
  const parts = input.trim().split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  if (!month || !day || !year || year.length !== 4) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
```
Converts `"08/15/2026"` → `"2026-08-15"`. Returns `null` on malformed input so the form can show an error before hitting the database.

### What I Should Remember
- `parseDate` converts mm/dd/yyyy → yyyy-mm-dd (what Postgres `date` columns expect).
- The org's profile ID is the `org_id` — it comes from the auth store, not from user input.
- `router.back()` on success returns to the opportunities list, which re-fetches on mount.

---

## File: `app/(org)/opportunities.tsx`

### Purpose
The org's list of their own posted opportunities, with the ability to delete any of them.

### In Plain English
The org can see everything they've posted — verified or not — with date, hours, and location. A trash icon on each card triggers a confirmation alert before deleting. A "post new" button in the header goes to the create screen. If the org has posted nothing yet, an empty state encourages them to get started.

The delete uses `Alert.alert` with a destructive button style — the native iOS/Android confirmation dialog, which is familiar and prevents accidental deletion.

### Key Code
```ts
Alert.alert(
  'delete opportunity',
  'students who signed up will no longer see this. are you sure?',
  [
    { text: 'cancel', style: 'cancel' },
    { text: 'delete', style: 'destructive', onPress: async () => { ... } },
  ]
);
```
`style: 'destructive'` renders "delete" in red on iOS (native behavior). The `cancel` option always appears first.

### What I Should Remember
- Orgs see all their own opportunities here, including unverified ones (so they can confirm posts went through).
- `deletingId` is a single ID (not boolean) so only the tapped card shows loading state.
- After deletion, local state is filtered immediately (optimistic update) — same pattern as verifications.
- The list does not auto-refresh after returning from create — `useEffect` re-runs on mount, so navigating back from the create screen triggers a fresh fetch.
