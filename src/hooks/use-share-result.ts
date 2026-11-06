import { useMutation } from '@tanstack/react-query';
import { Share } from 'react-native';

import type { BattleResult } from '@/types';

export function useShareResult() {
  return useMutation({
    mutationFn: (result: BattleResult) => Share.share({
      message: `${result.player} vs ${result.opponent}: ${result.winner === 'Draw' ? 'Draw' : `${result.winner} wins`} after ${result.turns} turns!`,
    }),
  });
}
