# Pokemon Battle

Choose two Pokemon and play a short battle using live PokeAPI data.

## Core action

Choose a move each turn and try to defeat the opponent.

## Features

1. [Setup](./features/setup.md)
2. [The fight](./features/fight.md)
3. [History](./features/history.md)
4. [Build your moveset](./features/moveset.md)

## Data

- API: https://pokeapi.co/api/v2. No key or login.
- `/pokemon?limit=100000`: names for complete local name search.
- `/pokemon/{id}`: base stats, types, artwork and available moves.
- `/move/{id}`: move power, type, accuracy and damage class.
- `/type/{name}`: damage relations, loaded once before the fight.
- SQLite `battles`: id, player, opponent, winner, turns, created_at.

## Technical choices

The implementation uses the following choices.

- Stored in SQLite: completed fights, because history is part of this route. Alternative: save the current unfinished fight; unnecessary for the base requirements.
- Native feature: React Native Share on a completed result. Alternative: haptics; sharing gives the user a useful battle summary without another package.
- Both Pokemon are level 50. Use the API base stats directly, without IVs, EVs or stat scaling, as required by the assignment.
- Your Pokemon starts with the first four API moves selected. You may replace them before the fight. The opponent uses its first four API moves and picks randomly each turn. Pokemon with fewer than four moves use what is available.
- A selected move without positive power becomes Struggle. Struggle always hits, ignores type and STAB, and causes one quarter of the attacker's maximum HP as recoil, rounded to the nearest integer. A double knockout is a draw.
- A turn is one pair of attacks. Faster Pokemon attacks first; equal speed is random. A fainted Pokemon does not attack.
- Reanimated shows the attack lunge, damage shake/flash, HP drain and fainting. Attacks play one at a time; the result appears after the final animation.

## Technical core

- Expo SDK 58 for the user's iPhone Expo Go, Expo Router, TypeScript and ESLint.
- TanStack Query for live API data and database reads/writes.
- Loading and error states for Pokemon, moves, types, history, saving and sharing.
- Screens, data hooks, services and battle rules in separate files.

## Out of scope

Abilities, items, status effects, weather, move priority, special move effects, PP, critical hits, teams, accounts, unfinished-fight persistence, saved movesets and other bonus work.

## Verification status

The feature checklists mark implemented and reviewed behaviour. They do not mean every case has been tested on a phone.

Local checks passed: ESLint, TypeScript, 24 logic tests, Android and iOS bundle checks, and a custom-moveset battle using the live API.

Phone checks are listed in each feature spec. The user confirmed on 6 November 2026 that battle history survives restarts. The native share sheet has not been confirmed in this chat.

The three explanation answers are prepared in [docs/explanation.md](../docs/explanation.md) for the student's review and wording. GitHub issue publication and the actual exported chat history remain separate hand-in steps.

A selected conversation record covering the UI improvements, custom movesets and battle animations is saved in [chat-history](../chat-history/ui-movesets-and-battle-animations.md). It is labelled as a manually compiled excerpt.
