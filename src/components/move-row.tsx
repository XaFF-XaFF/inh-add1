import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LoadState } from '@/components/load-state';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMove } from '@/hooks/use-pokemon';

type Props = { name: string; selected: boolean; disabled: boolean; onPress: () => void };

export function MoveRow({ name, selected, disabled, onPress }: Props) {
  const move = useMove(name);
  return (
    <View style={[styles.card, selected && styles.selected]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={name.replaceAll('-', ' ')}
        accessibilityState={{ checked: selected, disabled: disabled || !move.data }}
        disabled={disabled || !move.data}
        onPress={onPress}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.5 : 1 }]}
      >
        <View style={styles.details}>
          <Text style={styles.name}>{name.replaceAll('-', ' ')}</Text>
          {move.data && <Text style={styles.text}>
            {move.data.type} · Power {move.data.power ?? '—'} · Accuracy {move.data.accuracy === null ? 'always hits' : `${move.data.accuracy}%`}
            {!move.data.power && ' · uses Struggle'}
          </Text>}
        </View>
        <Text style={styles.action}>{selected ? 'Selected' : disabled ? 'Full' : 'Choose'}</Text>
      </Pressable>
      {!move.data && <LoadState message={move.isError ? 'Could not load move.' : 'Loading move...'} error={move.isError} onRetry={() => move.refetch()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.three, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.medium },
  selected: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  details: { flex: 1, gap: Spacing.two },
  name: { fontSize: 17, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  text: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  action: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
