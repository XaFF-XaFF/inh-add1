# Explanation

Route: Pokemon battle simulator. Agent tool: Codex.

## 1. Technical choices

Completed battles are stored in SQLite so the history survives restarting the app. The database is opened in [src/services/history-db.ts, line 9](../src/services/history-db.ts#L9), and `saveBattle` writes the Pokemon names, winner and turn count at [line 29](../src/services/history-db.ts#L29). An alternative was saving unfinished fights, but completed fights are needed for the required history. I confirmed that the saved history survives restarts.

The native feature is sharing a battle result. [src/hooks/use-share-result.ts, line 8](../src/hooks/use-share-result.ts#L8) calls React Native's `Share.share` with a short battle summary. Haptics was an alternative, but sharing lets the user send the result to someone else without adding another package.

These two choices stayed the same during development. A compatibility change was upgrading Expo SDK 57 to SDK 58 because my iPhone's Expo Go rejected the older version. The current version is declared in [package.json, line 16](../package.json#L16).

## 2. One feature from API to screen

The additional feature is choosing a Pokemon's moveset before the fight.

1. `getPokemon` in [src/services/pokeapi.ts, line 54](../src/services/pokeapi.ts#L54) requests the Pokemon from PokeAPI and returns its learnable move names. `usePokemon` in [src/hooks/use-pokemon.ts, line 12](../src/hooks/use-pokemon.ts#L12) loads and caches this data with TanStack Query.
2. [src/app/moves.tsx, line 25](../src/app/moves.tsx#L25) keeps the selected moves and search text in local state. The first four moves are selected by default. Each [MoveRow, line 9](../src/components/move-row.tsx#L9) uses `useMove` to load and display the move's type, power and accuracy. Failed loads show a Retry button.
3. Starting the battle passes the selected move names through route parameters at [src/app/moves.tsx, line 64](../src/app/moves.tsx#L64). `getBattleData` in [src/services/pokeapi.ts, line 99](../src/services/pokeapi.ts#L99) checks that the moves are different and belong to that Pokemon, then loads the moves and type relations.
4. [src/app/battle.tsx, line 64](../src/app/battle.tsx#L64) displays the chosen moves as battle buttons. The user picks a move each turn. The battle hook plays the attacks in order and disables the buttons while the animations run.

The available moves depend on the Pokemon species. The current version combines the API's game versions and does not filter moves by learning level.

## 3. A suggestion or implementation I changed

The agent's first battle animation implementation displayed the win message twice. During review, I pointed out: "You win shows up 2 times." I wanted one clear result instead of repeated information.

The result now appears in a single banner in [src/app/battle.tsx, line 48](../src/app/battle.tsx#L48). This correction also became a rule in [AGENTS.md, line 53](../AGENTS.md#L53), so future changes should keep only one result heading.

The request and the agent's correction are recorded in the [original session transcript](../chat-history/codex-session-01a198d0-f3d8-7861-9211-9caba46b67dd.md#message-msg_01a19911-f702-73b0-93eb-5c6c4b945c7d).
