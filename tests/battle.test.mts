import assert from 'node:assert/strict';
import test from 'node:test';

import type { BattleData, Move, Pokemon } from '../src/types.ts';
import { calculateDamage, createBattle, getEffectiveness, playTurn } from '../src/utils/battle.ts';

const pokemon: Pokemon = {
  id: 1, name: 'player', image: null, types: ['normal'], moves: ['tackle'],
  hp: 100, attack: 100, defense: 100, specialAttack: 50, specialDefense: 50, speed: 100,
};
const move: Move = { id: 1, name: 'tackle', power: 100, accuracy: 100, type: 'normal', damageClass: 'physical' };
const struggle: Move = { ...move, id: 165, name: 'struggle', power: 50, accuracy: null };
const neutral = { noDamage: [], halfDamage: [], doubleDamage: [] };

function battle(player: Partial<Pokemon> = {}, opponent: Partial<Pokemon> = {}): BattleData {
  return {
    player: { pokemon: { ...pokemon, ...player }, moves: [move] },
    opponent: { pokemon: { ...pokemon, id: 2, name: 'opponent', speed: 50, ...opponent }, moves: [move] },
    struggle,
    relations: { normal: neutral },
  };
}

test('level 50 damage uses physical stats, STAB and the 85–100 random range', () => {
  const defender = { ...pokemon, types: ['water'] };
  assert.equal(calculateDamage(pokemon, defender, move, 1, () => 0.999), 69);
  assert.equal(calculateDamage(pokemon, defender, move, 1, () => 0), 58);
  assert.equal(calculateDamage({ ...pokemon, types: ['fire'] }, defender, move, 1, () => 0.999), 46);
});

test('special moves use special attack and special defense', () => {
  const attacker = { ...pokemon, specialAttack: 200 };
  const defender = { ...pokemon, specialDefense: 50 };
  assert.equal(calculateDamage(attacker, defender, { ...move, damageClass: 'special' }, 1, () => 0.999), 267);
});

test('both defender types multiply API effectiveness, including immunity', () => {
  const relations = { noDamage: ['ghost'], halfDamage: ['rock'], doubleDamage: ['grass', 'ice'] };
  assert.equal(getEffectiveness(['grass', 'ice'], relations), 4);
  assert.equal(getEffectiveness(['grass', 'rock'], relations), 1);
  assert.equal(getEffectiveness(['grass', 'ghost'], relations), 0);
  assert.equal(calculateDamage(pokemon, pokemon, move, 0), 0);
});

test('damage has a minimum of one except for immunity', () => {
  assert.equal(calculateDamage({ ...pokemon, attack: 1 }, { ...pokemon, defense: 500 }, { ...move, power: 1 }, 0.25, () => 0), 1);
});

test('faster player knocks out opponent before it can attack', () => {
  const data = battle({}, { hp: 1 });
  const next = playTurn(createBattle(data), data, move, () => 0);
  assert.equal(next.winner, 'player');
  assert.equal(next.opponentHp, 0);
  assert.equal(next.playerHp, 100);
  assert.equal(next.turns, 1);
});

test('a faster opponent can knock out the player before the chosen move', () => {
  const data = battle({ hp: 1, speed: 1 });
  const next = playTurn(createBattle(data), data, move, () => 0);
  assert.equal(next.winner, 'opponent');
  assert.equal(next.opponentHp, 100);
  assert.equal(next.playerHp, 0);
});

test('equal speed can put either Pokemon first', () => {
  const data = battle({ hp: 1 }, { hp: 1, speed: 100 });
  assert.equal(playTurn(createBattle(data), data, move, () => 0).winner, 'player');
  assert.equal(playTurn(createBattle(data), data, move, () => 0.99).winner, 'opponent');
});

test('a missed move causes no damage', () => {
  const data = battle();
  data.opponent.moves = [{ ...move, accuracy: 0 }];
  const next = playTurn(createBattle(data), data, { ...move, accuracy: 0 }, () => 0.5);
  assert.equal(next.playerHp, 100);
  assert.equal(next.opponentHp, 100);
  assert.equal(next.log.filter((line) => line.includes('miss')).length, 2);
});

test('null accuracy always hits', () => {
  const data = battle({}, { hp: 1 });
  assert.equal(playTurn(createBattle(data), data, { ...move, accuracy: null }, () => 0.999).winner, 'player');
});

test('powerless moves become typeless Struggle with recoil', () => {
  const data = battle({}, { hp: 10, types: ['ghost'] });
  data.relations.normal = { ...neutral, noDamage: ['ghost'] };
  const next = playTurn(createBattle(data), data, { ...move, name: 'growl', power: null }, () => 0);
  assert.equal(next.winner, 'player');
  assert.equal(next.playerHp, 75);
  assert.equal(next.opponentHp, 0);
  assert.ok(next.log.some((line) => line.includes('Using Struggle')));
  assert.equal(calculateDamage(pokemon, pokemon, struggle, 1, () => 0.999), 24);
});

test('Struggle recoil can cause a draw and a finished fight cannot continue', () => {
  const data = battle({ hp: 1 }, { hp: 1 });
  const next = playTurn(createBattle(data), data, { ...move, power: 0 }, () => 0);
  assert.equal(next.winner, 'draw');
  assert.equal(next.playerHp, 0);
  assert.equal(next.opponentHp, 0);
  assert.equal(playTurn(next, data, move), next);
});

test('generation V Struggle recoil rounds half HP up', () => {
  const data = battle({ hp: 202 }, { hp: 1 });
  const next = playTurn(createBattle(data), data, { ...move, power: null }, () => 0);
  assert.equal(next.playerHp, 151);
});

test('normal attacks use cached relations and report immunity and effectiveness', () => {
  const data = battle({}, { types: ['ghost'], hp: 500 });
  data.relations.normal = { ...neutral, noDamage: ['ghost'] };
  let next = playTurn(createBattle(data), data, move, () => 0);
  assert.equal(next.opponentHp, 500);
  assert.ok(next.log.includes('No effect.'));
  data.relations.normal = { ...neutral, doubleDamage: ['ghost'] };
  next = playTurn(createBattle(data), data, move, () => 0);
  assert.ok(next.log.includes('Super effective!'));
  data.relations.normal = { ...neutral, halfDamage: ['ghost'] };
  next = playTurn(createBattle(data), data, move, () => 0);
  assert.ok(next.log.includes('Not very effective.'));
});

test('playback has one HP snapshot per attack in speed order', () => {
  const data = battle();
  const initial = createBattle(data);
  const next = playTurn(initial, data, move, () => 0);
  assert.equal(next.steps.length, 2);
  assert.equal(next.steps[0].attacker, 'player');
  assert.equal(next.steps[0].playerHp, 100);
  assert.equal(next.steps[0].opponentHp, 42);
  assert.equal(next.steps[1].attacker, 'opponent');
  assert.equal(next.steps[1].playerHp, next.playerHp);
  assert.equal(next.steps[1].opponentHp, next.opponentHp);
  assert.equal(initial.playerHp, 100);
  assert.deepEqual(initial.steps, []);
});

test('playback stops after a knockout and never schedules a fainted attacker', () => {
  const data = battle({ hp: 1, speed: 1 });
  const next = playTurn(createBattle(data), data, move, () => 0);
  assert.equal(next.steps.length, 1);
  assert.equal(next.steps[0].attacker, 'opponent');
  assert.equal(next.steps[0].playerHp, 0);
  assert.equal(next.winner, 'opponent');
});

test('misses and immunities produce zero-damage playback steps', () => {
  const data = battle({}, { types: ['ghost'] });
  data.opponent.moves = [{ ...move, accuracy: 0 }];
  data.relations.normal = { ...neutral, noDamage: ['ghost'] };
  const next = playTurn(createBattle(data), data, move, () => 0);
  assert.equal(next.steps[0].damage, 0);
  assert.ok(next.steps[0].messages.includes('No effect.'));
  assert.equal(next.steps[1].damage, 0);
  assert.ok(next.steps[1].messages.some((line) => line.includes('miss')));
  assert.equal(next.playerHp, 100);
  assert.equal(next.opponentHp, 100);
});

test('recoil playback shows actual lost HP and a double knockout', () => {
  const data = battle({}, { hp: 1 });
  const initial = { ...createBattle(data), playerHp: 1 };
  const next = playTurn(initial, data, { ...move, power: null }, () => 0);
  assert.equal(next.steps.length, 1);
  assert.equal(next.steps[0].move, 'struggle');
  assert.equal(next.steps[0].damage, 1);
  assert.equal(next.steps[0].recoil, 1);
  assert.equal(next.steps[0].playerHp, 0);
  assert.equal(next.steps[0].opponentHp, 0);
  assert.equal(next.winner, 'draw');
});
