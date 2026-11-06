import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean };

export function Button({ title, onPress, disabled, secondary }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, { opacity: disabled || pressed ? 0.5 : 1 }]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: Spacing.three, borderRadius: Radius.small, backgroundColor: Colors.primary, alignItems: 'center' },
  secondary: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  text: { color: Colors.buttonText, fontWeight: '600', fontSize: 16, textAlign: 'center' },
  secondaryText: { color: Colors.primary },
});
