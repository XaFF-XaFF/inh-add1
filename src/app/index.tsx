import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { LoadState } from '@/components/load-state';
import { PokemonCard } from '@/components/pokemon-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePokemon, usePokemonList } from '@/hooks/use-pokemon';
import { pokemonSprite } from '@/services/pokeapi';

const labels = ['Your Pokemon', 'Opponent'];

export default function SetupScreen() {
  const [ids, setIds] = useState(['', '']);
  const [target, setTarget] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const player = usePokemon(ids[0]);
  const opponent = usePokemon(ids[1]);
  const fighters = [player, opponent];
  const list = usePokemonList();
  const search = query.trim().toLowerCase().replaceAll(' ', '-');
  const pokemon = list.data?.filter((item) => item.name.includes(search)) ?? [];
  const ready = !!player.data && !!opponent.data;

  function select(id: number) {
    setIds(ids.map((value, index) => index === target ? String(id) : value));
    setTarget(null);
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose your fighters</Text>
        <Text style={styles.text}>Pick a Pokemon for each side. Both fight at level 50.</Text>
        <View style={styles.fighters}>
          {fighters.map((fighter, index) => (
            <View key={labels[index]} style={styles.slot}>
              {fighter.data ? <PokemonCard pokemon={fighter.data} label={labels[index]} /> : (
                <View style={styles.placeholder}>
                  <Text style={styles.role}>{labels[index]}</Text>
                  {ids[index] ? (
                    <LoadState message={fighter.isError ? 'Could not load Pokemon.' : 'Loading...'} error={fighter.isError} onRetry={() => fighter.refetch()} />
                  ) : <Text style={styles.question}>?</Text>}
                </View>
              )}
              <Button title={ids[index] ? 'Change' : 'Choose'} secondary onPress={() => { setQuery(''); setTarget(index); }} />
            </View>
          ))}
        </View>
        <Text style={styles.hint}>{ready ? 'Your matchup is ready.' : 'Choose both Pokemon to start.'}</Text>
        <Button title="Choose moves" disabled={!ready} onPress={() => router.push({ pathname: '/moves', params: { player: ids[0], opponent: ids[1] } })} />
        <Button title="Battle history" secondary onPress={() => router.push('/history')} />
      </ScrollView>

      {target !== null && (
        <Modal visible animationType="slide" onRequestClose={() => setTarget(null)}>
          <SafeAreaView style={styles.screen}>
            <View style={styles.content}>
              <View style={styles.row}>
                <Text style={[styles.title, styles.slot]}>{labels[target]}</Text>
                <Button title="Close" secondary onPress={() => setTarget(null)} />
              </View>
              <TextInput
                style={styles.search}
                placeholder="Search by name, e.g. pikachu"
                placeholderTextColor={Colors.muted}
                accessibilityLabel={`Search ${labels[target]}`}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                clearButtonMode="while-editing"
                returnKeyType="done"
              />
              {list.data && <Text style={styles.text}>{pokemon.length} Pokemon · tap one to select</Text>}
            </View>
            <FlatList
              data={pokemon}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.results}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name}`}
                  accessibilityState={{ selected: ids[target] === String(item.id) }}
                  onPress={() => select(item.id)}
                  style={({ pressed }) => [styles.item, ids[target] === String(item.id) && styles.selected, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Image source={{ uri: pokemonSprite(item.id) }} style={styles.sprite} />
                  <View style={styles.slot}>
                    <Text style={styles.name}>{item.name.replaceAll('-', ' ')}</Text>
                    <Text style={styles.text}>#{item.id}</Text>
                  </View>
                  <Text style={styles.action}>{ids[target] === String(item.id) ? 'Selected' : 'Choose'}</Text>
                </Pressable>
              )}
              ListEmptyComponent={list.data ? <Text style={styles.hint}>No Pokemon found. Try another name.</Text> : (
                <LoadState message={list.isError ? 'Could not load Pokemon.' : 'Loading Pokemon...'} error={list.isError} onRetry={() => list.refetch()} />
              )}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.three, gap: Spacing.three },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  text: { fontSize: 14, color: Colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fighters: { flexDirection: 'row', gap: Spacing.two },
  slot: { flex: 1, gap: Spacing.two },
  placeholder: { minHeight: 210, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, backgroundColor: Colors.card, borderRadius: Radius.medium },
  role: { fontSize: 16, fontWeight: '600', color: Colors.text },
  question: { fontSize: 64, color: Colors.border },
  hint: { color: Colors.muted, padding: Spacing.two, textAlign: 'center', fontSize: 16 },
  search: { color: Colors.text, backgroundColor: Colors.card, padding: Spacing.three, borderRadius: Radius.small, borderWidth: 1, borderColor: Colors.border, fontSize: 17 },
  results: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.two, backgroundColor: Colors.card, borderRadius: Radius.medium, borderWidth: 1, borderColor: Colors.border },
  selected: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  sprite: { width: 56, height: 56 },
  name: { fontSize: 18, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  action: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
