# GitHub issue drafts

These are local issue drafts. Checked items are implemented or have passed local checks; they do not mean a GitHub issue has been published or closed. Unconfirmed phone checks remain unticked.

## Build your moveset

Spec: `specs/features/moveset.md`.

Plan: expose the Pokemon's available move names, add a searchable move selection screen with type, power and accuracy previews, and pass the chosen moves to the battle.

- [x] Add searchable move selection and power/type/accuracy previews.
- [x] Validate selected moves and load only the chosen battle moves.
- [x] Keep four defaults selected, or all available moves when there are fewer than four.
- [x] Check moveset logic, lint, TypeScript and mobile bundles.
- [x] Confirm replacing moves while searching and starting with the chosen moves works on the phone.

## Setup

Spec: `specs/features/setup.md`.

Plan: create the Expo configuration and query provider, shared theme and UI, Pokemon API service, search/data hooks and setup screen.

- [x] Add configuration, query provider and shared theme.
- [x] Add API service and query hooks.
- [x] Add selection screen and previews.
- [x] Add loading, error and empty states.
- [x] Run lint and TypeScript.
- [x] Confirm search, changing either fighter and closing the search window work as expected on the phone.

## The fight

Spec: `specs/features/fight.md`.

Plan: load move and type data before the fight, keep battle rules in the utility, and play attack snapshots in order. Use the installed Reanimated package for attack, damage, HP and fainting animations. Save finished results and provide native sharing.

- [x] Load moves, Struggle and type relations.
- [x] Implement speed order, damage, accuracy and Struggle.
- [x] Add move buttons, HP and battle log.
- [x] Add attack snapshots and sequential playback with locked controls.
- [x] Animate attacks, damage, HP and fainting before showing the result.
- [x] Show the result in one banner.
- [x] Implement saving and sharing with error handling.
- [x] Run battle rule tests, lint, TypeScript and mobile bundle checks.
- [x] Confirm attack timing, misses, immunity, fainting and leaving during playback on the phone.
- [x] Confirm the native share sheet opens and shows the correct result.

## History

Spec: `specs/features/history.md`.

Plan: create one SQLite service and a history query hook. Show saved fights newest first in a FlatList.

- [x] Add parameterised database reads and writes.
- [x] Add history query and invalidate after saving.
- [x] Add history screen with loading, error and empty states.
- [x] Check persistence on a phone. User confirmed history survives restarts on 6 November 2026.
- [x] Run lint and TypeScript.
