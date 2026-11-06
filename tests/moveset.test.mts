import assert from 'node:assert/strict';
import test, { afterEach, mock } from 'node:test';

import { getBattleData, getPokemon } from '../src/services/pokeapi.ts';
import { createBattle, playTurn } from '../src/utils/battle.ts';

const moveNames = ['tackle', 'growl', 'slam', 'pound', 'surf', 'thunderbolt'];

function fakeApi(names = moveNames) {
  const calls: string[] = [];
  mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (url.includes('/pokemon/')) {
      return Response.json({
        id: 25, name: 'pikachu',
        sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
        types: [{ type: { name: 'normal' } }],
        moves: names.map((name) => ({ move: { name } })),
        stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
          .map((name) => ({ stat: { name }, base_stat: 100 })),
      });
    }
    if (url.includes('/move/')) {
      const name = url.split('/').pop();
      return Response.json({ id: 1, name, power: 40, accuracy: 100, type: { name: 'normal' }, damage_class: { name: 'physical' } });
    }
    if (url.includes('/type/')) {
      return Response.json({ damage_relations: { no_damage_to: [], half_damage_to: [], double_damage_to: [] } });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  return calls;
}

afterEach(() => mock.restoreAll());

test('Pokemon exposes all available move names for selection', async () => {
  fakeApi();
  const pokemon = await getPokemon('25');
  assert.deepEqual(pokemon.moves, moveNames);
});

test('battle uses the chosen moves and only four defaults for the opponent', async () => {
  const calls = fakeApi();
  const pokemon = await getPokemon('25');
  const chosen = ['surf', 'thunderbolt', 'pound', 'slam'];
  const data = await getBattleData(pokemon, pokemon, chosen);
  assert.deepEqual(data.player.moves.map((move) => move.name), chosen);
  assert.deepEqual(data.opponent.moves.map((move) => move.name), moveNames.slice(0, 4));
  assert.equal(calls.filter((url) => url.includes('/type/')).length, 1);
  const beforeTurn = calls.length;
  playTurn(createBattle(data), data, data.player.moves[0], () => 0);
  assert.equal(calls.length, beforeTurn);
});

test('battle defaults still work without a custom moveset', async () => {
  fakeApi();
  const pokemon = await getPokemon('25');
  const data = await getBattleData(pokemon, pokemon);
  assert.deepEqual(data.player.moves.map((move) => move.name), moveNames.slice(0, 4));
});

test('duplicate, incomplete and unavailable movesets are rejected', async () => {
  fakeApi();
  const pokemon = await getPokemon('25');
  await assert.rejects(getBattleData(pokemon, pokemon, ['tackle']), /full set/);
  await assert.rejects(getBattleData(pokemon, pokemon, ['tackle', 'tackle', 'slam', 'pound']), /different moves/);
  await assert.rejects(getBattleData(pokemon, pokemon, ['tackle', 'growl', 'slam', 'unknown']), /move list/);
});

test('Pokemon with fewer than four moves use their available moves', async () => {
  fakeApi(['tackle']);
  const pokemon = await getPokemon('25');
  const data = await getBattleData(pokemon, pokemon, ['tackle']);
  assert.equal(data.player.moves.length, 1);
});

test('Pokemon without moves can use Struggle', async () => {
  fakeApi([]);
  const pokemon = await getPokemon('25');
  assert.deepEqual(pokemon.moves, ['struggle']);
  const data = await getBattleData(pokemon, pokemon);
  assert.equal(data.player.moves[0].name, 'struggle');
});

test('a failed move request rejects the battle load', async () => {
  fakeApi();
  const pokemon = await getPokemon('25');
  mock.restoreAll();
  mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  await assert.rejects(getBattleData(pokemon, pokemon), /Could not load/);
});
