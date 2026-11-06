# History

## Goal

See completed fights after restarting the app.

## Constraints

Use one SQLite database, parameterised SQL and TanStack Query hooks. No new dependencies.

Checked items are implemented and reviewed. Phone checks are listed separately.

## Acceptance Criteria

- [x] Show player, opponent, winner or draw, turns and date for every saved fight.
- [x] Show newest results first.
- [x] Show an empty state before any fights have been saved.
- [x] Show loading and a retryable error if reading fails.
- [x] Store completed battles in a persistent SQLite database.

## Phone checks

- [x] Finish a battle, close Expo Go completely, reopen it and confirm the saved result remains in history. User confirmed restart persistence on 6 November 2026.

## Out of Scope

Deleting history, replay, charts and cloud sync.
