# Greenie — Code Guide

Plain-English explanations of every important file in the project. Updated after every milestone.

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

---

## File: `services/opportunities.ts`

### Purpose
All database operations related to opportunities — fetching them, fetching a single one, signing up, and checking what a student has already signed up for.

### In Plain English
Same pattern as `services/auth.ts`. Screens never touch Supabase directly — they call these functions. Four functions: get all opportunities (for the swipe stack), get one opportunity (for the detail screen), sign up for an opportunity, and get a student's list of signups (so the detail screen knows whether to show "You're signed up" or a button).

### Key Code
```ts
const { data, error } = await supabase
  .from('opportunities')
  .select('*, profiles(full_name)')
  .order('date', { ascending: true });
```
`select('*, profiles(full_name)')` means: give me all columns from `opportunities`, AND for each row, look up the related row in `profiles` using the `org_id` foreign key and include just the `full_name`. This is a join in one line — no separate query needed.

```ts
export async function getStudentSignups(studentId: string): Promise<string[]> {
  const { data } = await supabase
    .from('opportunity_signups')
    .select('opportunity_id')
    .eq('student_id', studentId);
  return data.map((row) => row.opportunity_id);
}
```
Returns a plain array of opportunity IDs the student has signed up for. The detail screen checks `signups.includes(id)` to decide what to show.

### What I Should Remember
- `.select('*, profiles(full_name)')` fetches a related row from another table in one query.
- Services throw errors; screens catch them.
- `getStudentSignups` returns an array of IDs so the detail screen can check membership with `.includes()`.

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
- `interpolate` lets you derive one animated value from another (rotation from position).
- `useNativeDriver: true` is always preferred — it runs animations on the GPU, not in JavaScript.
- This component is generic — it has no knowledge of opportunities. It just moves and calls callbacks.
- `key={currentIndex}` in the parent is critical — it forces React to recreate this component for each new card, resetting all gesture state.

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

## File: `app/(auth)/_layout.tsx`, `app/(student)/_layout.tsx`, `app/(org)/_layout.tsx`

### Purpose
Define navigation containers for each group of screens, with the header hidden.

### In Plain English
Expo Router uses "route groups" — folders with parentheses in the name, like `(auth)`. The folder name is invisible to navigation (the URL is `/sign-in`, not `/(auth)/sign-in`). The `_layout.tsx` inside each group defines how screens in that group are wrapped. All three layouts just render `<Stack screenOptions={{ headerShown: false }} />` — a stack navigator with no visible header bar.

### What I Should Remember
- Folders named `(like-this)` are route groups — they group screens without affecting the URL.
- `_layout.tsx` must exist in every route group or Expo Router won't recognize it.
- `headerShown: false` hides the default navigation bar that would otherwise appear at the top of every screen.

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

## File: `app/(student)/dashboard.tsx` and `app/(org)/dashboard.tsx`

### Purpose
Placeholder screens for the student and organization dashboards, created so routing has somewhere to land while real content is built in later milestones.

### In Plain English
These screens exist so the app doesn't crash when routing sends a user to their dashboard. Right now they just show a welcome message and a sign-out button. They will be replaced with real content in Milestones 3 and 4.

### How It Works
Both read `profile` from the auth store to display the user's name. The sign-out button calls `signOut()`, clears the store, and redirects to sign-in.

### Key Code
```tsx
async function handleSignOut() {
  await signOut();
  setSession(null);
  setProfile(null);
  router.replace('/(auth)/sign-in');
}
```
Sign-out is three steps: tell Supabase to end the session, clear our local store (so the app doesn't think anyone is still logged in), and navigate back to sign-in.

### What I Should Remember
- These are placeholder screens — their content will be replaced.
- Always clear the local store on sign-out, not just call `signOut()`. Otherwise the app thinks the user is still logged in.
- `router.replace` on sign-out prevents the user from pressing "back" to return to a logged-in screen.
