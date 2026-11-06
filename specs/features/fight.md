# The fight

## Goal

Choose real moves and finish a battle.

## Constraints

Use the API base stats directly at level 50. Keep battle calculations outside screens. All colours come from the theme.

Checked items are implemented and reviewed. Phone checks are listed separately.

## Acceptance Criteria

- [x] Load up to four real moves per Pokemon, Struggle and type relations with loading and retryable errors.
- [x] Player chooses a move; opponent chooses randomly. Speed determines order, ties are random.
- [x] Calculate generation V style damage with physical/special stats, move power, random 85–100%, STAB and both defender types from API relations.
- [x] Replace moves without positive power with Struggle.
- [x] Show HP bars, turn log, hits, misses and effectiveness. Stop at zero HP and show a winner or draw.
- [x] Play attacks one at a time, with a lunge, damage feedback and a draining HP bar. Misses and immunity do not show damage feedback.
- [x] Disable move buttons during playback. Keep fighters visible while controls and the log scroll.
- [x] Show fainting after HP reaches zero, then show an explicit win, loss or draw. Save the result after playback finishes.
- [x] Leaving the fight stops playback updates and does not save an unfinished result.
- [x] Save the completed result automatically; show and retry a failed save without losing the result.
- [x] Share the result using the native share sheet; show a failed share.

## Phone checks

- [ ] Confirm attack timing, misses, immunity, fainting and leaving during playback on the phone.
- [x] Confirm the native share sheet opens and shows the correct result. User confirmed sharing works on 6 November 2026.

## Out of Scope

Abilities, items, status, weather, move priority, PP, critical hits and special move effects. No move-specific projectiles or sound effects.
