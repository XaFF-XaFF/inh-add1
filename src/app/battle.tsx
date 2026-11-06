import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { LoadState } from '@/components/load-state';
import { PokemonCard } from '@/components/pokemon-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useBattle } from '@/hooks/use-battle';
import { useBattleData, usePokemon } from '@/hooks/use-pokemon';
import { useShareResult } from '@/hooks/use-share-result';
import type { BattleData } from '@/types';

export default function BattleScreen() {
  const params = useLocalSearchParams<{ player?: string; opponent?: string; moves?: string }>();
  const player = usePokemon(params.player ?? '');
  const opponent = usePokemon(params.opponent ?? '');
  const moves = params.moves?.split(',');
  const battle = useBattleData(player.data, opponent.data, moves);

  if (!params.player || !params.opponent) {
    return <Button title="Choose two Pokemon" onPress={() => router.replace('/')} />;
  }
  
  if (!player.data || !opponent.data) {
    return <LoadState message={player.isError || opponent.isError ? 'Could not load the fighters.' : 'Loading fighters...'} error={player.isError || opponent.isError} onRetry={() => { player.refetch(); opponent.refetch(); }} />;
  }
  
  if (!battle.data) {
    return <LoadState message={battle.isError ? 'Could not load moves or types.' : 'Loading moves and types...'} error={battle.isError} onRetry={() => battle.refetch()} />;
  }
  
  return <Fight key={`${player.data.id}-${opponent.data.id}-${params.moves ?? ''}`} data={battle.data} />;
}

function Fight({ data }: { data: BattleData }) {
  const { state, result, chooseMove, save, action, message, isPlaying } = useBattle(data);
  const share = useShareResult();
  const resultColor = state.winner === 'player' ? Colors.healthSoft : state.winner === 'opponent' ? Colors.errorSoft : Colors.primarySoft;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
      <View style={styles.arena}>
        <View style={styles.row}>
          <PokemonCard pokemon={data.player.pokemon} label="You" hp={state.playerHp} side="player" action={action} />
          <PokemonCard pokemon={data.opponent.pokemon} label="Opponent" hp={state.opponentHp} side="opponent" action={action} />
        </View>
        <View style={[styles.message, result && { backgroundColor: resultColor }]}>
          <Text style={styles.turn}>Turn {state.turns}{isPlaying ? ' · Playing...' : ''}</Text>
          <Text style={result ? styles.title : styles.text} accessibilityLiveRegion="polite">{message}</Text>
          {result && <Text style={styles.text}>
            {state.winner === 'draw' ? 'Both Pokemon fainted.' : state.winner === 'player'
              ? `Your ${result.player} defeated the opponent's ${result.opponent}.`
              : `The opponent's ${result.opponent} defeated your ${result.player}.`}
          </Text>}
        </View>
      </View>
      <FlatList
        data={state.log}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            {!result && data.player.moves.map((move) => (
              <Button
                key={move.id}
                title={`${move.name.replaceAll('-', ' ')} · ${move.power ? `${move.type}, power ${move.power}` : 'uses Struggle'}`}
                disabled={isPlaying}
                onPress={() => chooseMove(move)}
              />
            ))}
            {result && (
              <>
                {save.isPending && <LoadState message="Saving result..." />}
                {save.isError && <LoadState message="Result could not be saved." error onRetry={() => save.mutate(result)} />}
                {save.isSuccess && <Text style={styles.text}>Result saved.</Text>}
                <Button title={share.isPending ? 'Opening share sheet...' : 'Share result'} disabled={share.isPending} onPress={() => share.mutate(result)} />
                {share.isError && <Text style={styles.error}>Could not share. Please try again.</Text>}
                <Button title="Battle history" secondary disabled={save.isPending || save.isError} onPress={() => router.push('/history')} />
                <Button title="New battle" secondary disabled={save.isPending || save.isError} onPress={() => router.replace('/')} />
              </>
            )}
            <Text style={styles.title}>Battle log</Text>
          </View>
        }
        renderItem={({ item }) => <Text style={styles.log}>{item}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  arena: { padding: Spacing.three, gap: Spacing.two },
  content: { padding: Spacing.three, paddingTop: 0, gap: Spacing.two },
  header: { gap: Spacing.two, marginBottom: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  text: { fontSize: 16, lineHeight: 23, color: Colors.text },
  turn: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  message: { minHeight: 90, padding: Spacing.three, gap: Spacing.two, backgroundColor: Colors.card, borderRadius: Radius.medium },
  error: { color: Colors.error, fontSize: 16 },
  log: { fontSize: 15, lineHeight: 22, color: Colors.muted },
});
