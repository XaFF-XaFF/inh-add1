# Setup

## Goal

Pick two Pokemon to fight.

## Constraints

Use live PokeAPI data with TanStack Query. Use the course screen, hook and service structure. No extra dependencies.

Checked items are implemented and reviewed. Phone checks are listed separately.

## Acceptance Criteria

- [x] Search every API Pokemon by part of its name, ignoring case.
- [x] Pick a player and an opponent, including the same Pokemon on both sides.
- [x] Each fighter has a Choose/Change button opening the same search window. Closing it preserves both selections.
- [x] Search stays above the results; rows show a sprite, name and number, and highlight the current selection.
- [x] Preview both Pokemon with artwork, types and level 50.
- [x] Enable Choose moves only when both Pokemon have loaded, then continue to move selection.
- [x] Show loading, retryable errors and no-match states.

## Phone checks

- [ ] Confirm search, changing either fighter and closing the search window work as expected on the phone.

## Out of Scope

Team selection, random selection, filters and accounts.
