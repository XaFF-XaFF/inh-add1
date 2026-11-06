# Pokemon Battle

A React Native app using Expo SDK 58, Expo Router, TanStack Query and expo-sqlite. It runs in Expo Go and gets live Pokemon data from PokeAPI.

## Scope and simplicity

- Build setup, move selection, the fight and history, including the requested battle animations. Keep other extras out of scope.
- Use small function components and plain functions. Avoid extra layers, classes or libraries when a simple function is enough.
- Keep names clear and comments short. Add a comment only when the reason for the code needs explaining.
- Reuse existing components and packages. Do not refactor unrelated files or edit the course material outside this app.

## Structure

- `src/app/`: screens and Expo Router layouts. Screens render UI and call hooks; they do not call `fetch` or run SQL.
- `src/components/`: reusable UI such as buttons, Pokemon cards and move rows.
- `src/hooks/`: TanStack Query hooks, battle state and playback control.
- `src/services/`: PokeAPI requests and SQLite functions. Services do not render UI.
- `src/utils/`: battle calculations that do not depend on React, navigation or the database.
- `src/constants/theme.ts`: shared colours, spacing and border radii. Do not put hex colours in components.
- Reuse the QueryClient in `src/app/_layout.tsx` and the database in `src/services/history-db.ts`. Do not create a second client or database.

## Data and asynchronous code

- Use TanStack Query `useQuery` for API data and SQLite reads. Keep API data in the query cache instead of copying it into component state.
- Include the resource ID and other inputs, such as selected moves, in the query key so different requests have separate cache entries.
- Use `enabled` when a query needs a selected Pokemon first. Show a selection hint while it is disabled.
- Reuse the one-hour `staleTime` for Pokemon and move data. Filter cached names for search instead of requesting the API on every keystroke.
- Use `useMutation` for saving battle results. After a successful save, invalidate the history query so the list refreshes.
- Write API and database functions with `async` and `await`. Return their data through promises; do not return before the operation finishes.
- Use plain `fetch` in the API service. Check `response.ok` before reading JSON and throw an error if the request fails.
- Use `Promise.all` for independent requests, such as loading several moves. Await dependent data before using it, such as loading moves before their type relations.
- Let request and database errors reach TanStack Query. Show query or mutation errors in the UI instead of swallowing them.
- Show cached data first when available. Otherwise use `isPending` for loading, and show an error with a Retry button calling `refetch()`.
- Handle failed saving and sharing visibly. Use `try/finally` when a temporary lock or loading state must be released.

## State and navigation

- Use `useState` for search text, selected Pokemon, selected moves and other local UI state.
- Update arrays with `map`, `filter` or spread syntax. Use a functional state update when the new value depends on the previous value.
- Use `useEffect` for animation and lifecycle work, not for fetching API data. Stop playback updates when the fight unmounts.
- Use Expo Router for navigation. Pass Pokemon IDs and selected move names through route parameters and read them with typed `useLocalSearchParams`.
- Keep damage, accuracy, speed order and type effectiveness in the battle utility. Load moves and type relations before the fight; do not make API requests during a turn.

## Storage and UI

- Store completed fights in SQLite so history survives a restart. Create the table with `CREATE TABLE IF NOT EXISTS` and reuse the existing database connection.
- Use `?` placeholders and parameter arrays for SQL values. Never build SQL by joining user input into the query.
- Use native `View`, `Text`, `Image`, `TextInput` and `Pressable` components. Put visible text inside `Text` and show feedback when a button is pressed.
- Use `FlatList` with stable keys for Pokemon, moves and history. Use `ScrollView` for short content.
- Style with `StyleSheet.create`, Flexbox and theme values. Respect safe areas with `react-native-safe-area-context`.
- Reuse the same selection UI for both fighters. Keep Pokemon search separate from the main setup view.
- Use the installed Reanimated package for attack, damage, HP and fainting animations. Play attacks in order and disable move buttons during playback.
- Show the result after the final animation, in one banner. Do not repeat the win/loss heading below it.

## Checks and workflow

- Define TypeScript types for props, API responses and battle data. Fix type errors instead of hiding them.
- Run `npm run lint` and `npm run typecheck` after code changes. Run `npm test` after changing battle or moveset logic.
- Check the Expo SDK version in `package.json` and its matching documentation before changing Expo APIs. Install packages with `npx expo install` and check that native modules work in Expo Go.
- Update feature checklists after implementation. Keep unverified phone checks separate; do not mark them tested without confirmation.
- Once the student's own GitHub repository is available, use one issue per feature. Post the plan and task checklist on the issue and wait for the user's go before building it. Keep the checklist updated and link the closing commit to the issue.
