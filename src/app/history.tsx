import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadState } from '@/components/load-state';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useHistory } from '@/hooks/use-history';

export default function HistoryScreen() {
  const history = useHistory();
  if (!history.data) {
    return <LoadState message={history.isError ? 'Could not load battle history.' : 'Loading history...'} error={history.isError} onRetry={() => history.refetch()} />;
  }
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
      <FlatList
        data={history.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<Text style={styles.text}>No battles yet. Finish a fight to save it here.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.player} vs {item.opponent}</Text>
            <Text style={styles.text}>{item.winner === 'Draw' ? 'Draw' : `Winner: ${item.winner}`}</Text>
            <Text style={styles.text}>{item.turns} turns · {new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three },
  card: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Colors.card },
  title: { color: Colors.text, fontSize: 18, fontWeight: '600', textTransform: 'capitalize' },
  text: { color: Colors.muted, fontSize: 16 },
});
