import { useEffect, useRef, useState } from 'react';

import { useSaveBattle } from '@/hooks/use-history';
import type { BattleAction, BattleData, BattleResult, Move } from '@/types';
import { createBattle, playTurn } from '@/utils/battle';

const pause = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function useBattle(data: BattleData) {
  const [state, setState] = useState(() => createBattle(data));
  // Keep quick taps on the latest turn.
  const current = useRef(state);
  const playing = useRef(false);
  const mounted = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [action, setAction] = useState<BattleAction | null>(null);
  const [message, setMessage] = useState('Choose a move to begin.');
  const [id] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [result, setResult] = useState<BattleResult | null>(null);
  const save = useSaveBattle();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function chooseMove(move: Move) {
    if (playing.current || current.current.winner) return;
    playing.current = true;
    setIsPlaying(true);

    try {
      const next = playTurn(current.current, data, move);
      setState((previous) => ({ ...previous, turns: next.turns, log: [`Turn ${next.turns}`, ...previous.log] }));
      
      for (const step of next.steps) {
        const attacker = step.attacker === 'player' ? 'Your' : 'Opponent';
        const name = data[step.attacker].pokemon.name;
        setMessage(`${attacker} ${name} used ${step.move.replaceAll('-', ' ')}!`);
        setAction({ step, phase: 'attack' });
        await pause(500);
        
        if (!mounted.current) return;
        
        setState((previous) => ({ ...previous,
          playerHp: step.playerHp, opponentHp: step.opponentHp,
          log: [...step.messages, ...previous.log],
        }));

        setMessage(step.messages.join('\n'));
        setAction({ step, phase: 'damage' });
        await pause(1200);
        if (!mounted.current) return;
        if (step.playerHp === 0 || step.opponentHp === 0) {
          setAction({ step, phase: 'faint' });
          setMessage(step.playerHp === 0 && step.opponentHp === 0 ? 'Both Pokemon fainted.'
            : step.playerHp === 0 ? 'Your Pokemon fainted.' : 'Opponent Pokemon fainted.');
          await pause(700);
          if (!mounted.current) return;
        }
      }
      
      current.current = next;
      setState(next);
      setAction(null);
      setMessage(next.winner === 'player' ? 'You win!' : next.winner === 'opponent' ? 'You lose!'
        : next.winner === 'draw' ? 'Draw!' : 'Choose your next move.');
      
        if (next.winner) {
        const finished = {
          id,
          player: data.player.pokemon.name,
          opponent: data.opponent.pokemon.name,
          winner: next.winner === 'draw' ? 'Draw' : next.winner === 'player' ? data.player.pokemon.name : data.opponent.pokemon.name,
          turns: next.turns,
        };
        
        setResult(finished);
        save.mutate(finished);
      }
    } finally {
      playing.current = false;
      if (mounted.current) setIsPlaying(false);
    }
  }

  return { state, result, chooseMove, save, action, message, isPlaying };
}
