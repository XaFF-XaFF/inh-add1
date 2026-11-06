import type { BattleData, Move, Pokemon, PokemonName, TypeRelations } from '@/types';

const baseUrl = 'https://pokeapi.co/api/v2';

export function pokemonSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

type NamedResource = { name: string; url: string };

type PokemonResponse = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: { 'official-artwork': { front_default: string | null } };
  };
  types: { type: NamedResource }[];
  moves: { move: NamedResource }[];
  stats: { base_stat: number; stat: NamedResource }[];
};

type MoveResponse = {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  type: NamedResource;
  damage_class: NamedResource;
};

type TypeResponse = {
  damage_relations: {
    no_damage_to: NamedResource[];
    half_damage_to: NamedResource[];
    double_damage_to: NamedResource[];
  };
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}/${path}`);
  if (!response.ok) throw new Error('Could not load PokeAPI data. Please try again.');
  return response.json();
}

export async function getPokemonList(): Promise<PokemonName[]> {
  const data = await getJson<{ results: NamedResource[] }>('pokemon?limit=100000');
  return data.results.map((pokemon) => ({
    id: Number(pokemon.url.split('/').filter(Boolean).pop()),
    name: pokemon.name,
  }));
}

export async function getPokemon(id: string): Promise<Pokemon> {
  const data = await getJson<PokemonResponse>(`pokemon/${id}`);
  
  function stat(name: string) {
    const value = data.stats.find((entry) => entry.stat.name === name);
    if (!value) throw new Error(`Missing Pokemon stat: ${name}`);
    return value.base_stat;
  }

  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default ?? data.sprites.front_default,
    types: data.types.map((entry) => entry.type.name),
    moves: data.moves.length ? data.moves.map((entry) => entry.move.name) : ['struggle'],
    hp: stat('hp'),
    attack: stat('attack'),
    defense: stat('defense'),
    specialAttack: stat('special-attack'),
    specialDefense: stat('special-defense'),
    speed: stat('speed'),
  };
}

export async function getMove(name: string): Promise<Move> {
  const data = await getJson<MoveResponse>(`move/${name}`);
  return {
    id: data.id,
    name: data.name,
    power: data.power,
    accuracy: data.accuracy,
    type: data.type.name,
    damageClass: data.damage_class.name,
  };
}

async function getType(name: string): Promise<TypeRelations> {
  const { damage_relations: relations } = await getJson<TypeResponse>(`type/${name}`);
  return {
    noDamage: relations.no_damage_to.map((type) => type.name),
    halfDamage: relations.half_damage_to.map((type) => type.name),
    doubleDamage: relations.double_damage_to.map((type) => type.name),
  };
}

export async function getBattleData(
  player: Pokemon,
  opponent: Pokemon,
  chosenMoves = player.moves.slice(0, 4),
): Promise<BattleData> {
  
  if (chosenMoves.length !== Math.min(4, player.moves.length)
    || new Set(chosenMoves).size !== chosenMoves.length
    || chosenMoves.some((name) => !player.moves.includes(name))) {
    throw new Error('Choose a full set of different moves from your Pokemon\'s move list.');
  
  }
  const opponentMoves = opponent.moves.slice(0, 4);
  const names = [...new Set([...chosenMoves, ...opponentMoves, 'struggle'])];
  const moves = await Promise.all(names.map(getMove));
  
  function findMove(name: string) {
    const move = moves.find((entry) => entry.name === name);
    if (!move) throw new Error('Could not load a move. Please try again.');
    return move;
  
  }
  const types = [...new Set(moves.map((move) => move.type))];
  const relations: Record<string, TypeRelations> = {};
  
  await Promise.all(types.map(async (type) => { relations[type] = await getType(type); }));
  
  const struggle = findMove('struggle');
  
  return {
    player: { pokemon: player, moves: chosenMoves.map(findMove) },
    opponent: { pokemon: opponent, moves: opponentMoves.map(findMove) },
    struggle,
    relations,
  };
}
