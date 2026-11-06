import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { LoadState } from '@/components/load-state';
import { MoveRow } from '@/components/move-row';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePokemon } from '@/hooks/use-pokemon';
import type { Pokemon } from '@/types';

export default function MovesScreen() {
  const params = useLocalSearchParams<{ player?: string; opponent?: string }>();
  const player = usePokemon(params.player ?? '');
  if (!params.player || !params.opponent) {
    return <Button title="Choose two Pokemon" onPress={() => router.replace('/')} />;
  }
  if (!player.data) {
    return <LoadState message={player.isError ? 'Could not load moves.' : 'Loading Pokemon...'} error={player.isError} onRetry={() => player.refetch()} />;
  }
  return <MoveSelection key={player.data.id} pokemon={player.data} opponentId={params.opponent} />;
}

function MoveSelection({ pokemon, opponentId }: { pokemon: Pokemon; opponentId: string }) {
  const [selected, setSelected] = useState(pokemon.moves.slice(0, 4));
  const [query, setQuery] = useState('');
  const limit = Math.min(4, pokemon.moves.length);
  const moves = pokemon.moves.filter((name) => name.includes(query.trim().toLowerCase().replaceAll(' ', '-')));

  function toggle(name: string) {
    setSelected((previous) => previous.includes(name) ? previous.filter((move) => move !== name)
      : previous.length < limit ? [...previous, name] : previous);
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{`${pokemon.name.replaceAll('-', ' ')}'s moves`}</Text>
        <Text style={styles.count}>{selected.length} / {limit} selected · tap a move to remove</Text>
        <View style={styles.selected}>
          {selected.map((name) => (
            <Pressable key={name} accessibilityRole="button" accessibilityLabel={`Remove ${name}`} onPress={() => toggle(name)} style={styles.chip}>
              <Text style={styles.chipText}>{name.replaceAll('-', ' ')} ×</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.search} value={query} onChangeText={setQuery}
          placeholder="Search moves" placeholderTextColor={Colors.muted}
          accessibilityLabel="Search moves" autoCapitalize="none" autoCorrect={false} clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={moves} keyExtractor={(name) => name}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets
        initialNumToRender={8} maxToRenderPerBatch={8} windowSize={3}
        renderItem={({ item }) => <MoveRow name={item} selected={selected.includes(item)} disabled={!selected.includes(item) && selected.length === limit} onPress={() => toggle(item)} />}
        ListEmptyComponent={<Text style={styles.text}>No moves found.</Text>}
      />
      <View style={styles.footer}>
        <Button title="Start battle" disabled={selected.length !== limit} onPress={() => router.push({
          pathname: '/battle', params: { player: String(pokemon.id), opponent: opponentId, moves: selected.join(',') },
        })} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: Spacing.three, gap: Spacing.two },
  footer: { padding: Spacing.three },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  text: { fontSize: 14, lineHeight: 20, color: Colors.muted },
  count: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  selected: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { padding: Spacing.two, borderRadius: Radius.small, backgroundColor: Colors.primarySoft },
  chipText: { fontSize: 14, color: Colors.primary },
  search: { padding: Spacing.three, backgroundColor: Colors.card, borderRadius: Radius.small, borderWidth: 1, borderColor: Colors.border, fontSize: 16, color: Colors.text },
  list: { padding: Spacing.three, gap: Spacing.two },
});
