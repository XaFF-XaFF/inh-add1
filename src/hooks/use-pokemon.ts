import { useQuery } from '@tanstack/react-query';

import { getBattleData, getMove, getPokemon, getPokemonList } from '@/services/pokeapi';
import type { Pokemon } from '@/types';

const staleTime = 60 * 60 * 1000;

export function usePokemonList() {
  return useQuery({ queryKey: ['pokemon', 'list'], queryFn: getPokemonList, staleTime });
}

export function usePokemon(id: string) {
  return useQuery({
    queryKey: ['pokemon', 'detail', id],
    queryFn: () => getPokemon(id),
    enabled: id.length > 0,
    staleTime,
  });
}

export function useMove(name: string) {
  return useQuery({ queryKey: ['move', name], queryFn: () => getMove(name), staleTime });
}

export function useBattleData(player?: Pokemon, opponent?: Pokemon, moves?: string[]) {
  return useQuery({
    queryKey: ['battle-data', player?.id, opponent?.id, moves ?? []],
    queryFn: () => {
      if (!player || !opponent) throw new Error('Choose two Pokemon first.');
      return getBattleData(player, opponent, moves);
    },
    enabled: !!player && !!opponent,
    staleTime,
  });
}
