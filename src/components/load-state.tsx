import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Colors, Spacing } from '@/constants/theme';

type Props = { message: string; error?: boolean; onRetry?: () => void };

export function LoadState({ message, error, onRetry }: Props) {
  return (
    <View style={styles.container}>
      {!error && <ActivityIndicator color={Colors.primary} />}
      <Text style={[styles.text, error && styles.error]}>{message}</Text>
      {error && onRetry && <Button title="Retry" onPress={onRetry} secondary />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.three, gap: Spacing.two, alignItems: 'center' },
  text: { color: Colors.muted, textAlign: 'center', fontSize: 16 },
  error: { color: Colors.error },
});
