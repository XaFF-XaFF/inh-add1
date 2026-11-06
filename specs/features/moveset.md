# Build your moveset

## Goal

Choose your Pokemon's moves before the battle so you can try different strategies.

## Constraints

Use the Pokemon's live API move list. Keep the first four moves selected by default. No saved movesets, PP, status effects or new packages. The opponent keeps its first four API moves.

Checked items are implemented and reviewed. Phone checks are listed separately.

## Acceptance Criteria

- [x] Open move selection after choosing the two fighters.
- [x] Search all available moves by part of their name, ignoring case.
- [x] Show each visible move's type, power and accuracy, with loading and retryable errors.
- [x] Choose four different moves, or all available moves if the Pokemon has fewer than four.
- [x] Remove selected moves from the selection summary, including while searching.
- [x] Start with the default moves or a custom selection. Only chosen moves appear in the player's battle controls.
- [x] Moves without power still become Struggle under the existing battle rules.

## Phone checks

- [ ] Confirm replacing moves while searching and starting with the chosen moves works on the phone.

## Out of Scope

Saved movesets, choosing the opponent's moves, filtering by generation or learning level, PP and status effects.
