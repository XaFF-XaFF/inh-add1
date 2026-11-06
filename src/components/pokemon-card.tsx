import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { BattleAction, BattleSide, Pokemon } from '@/types';

type Props = { pokemon: Pokemon; label: string; hp?: number; side?: BattleSide; action?: BattleAction | null };

export function PokemonCard({ pokemon, label, hp, side, action }: Props) {
  const health = useSharedValue((hp ?? pokemon.hp) / pokemon.hp);
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);
  const fall = useSharedValue(0);
  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: offset.get() }, { translateY: fall.get() }],
  }));
  const healthStyle = useAnimatedStyle(() => ({ width: `${health.get() * 100}%` }));

  useEffect(() => {
    health.set(withTiming((hp ?? pokemon.hp) / pokemon.hp, { duration: 650 }));
  }, [hp, pokemon.hp, health]);

  useEffect(() => {
    if (!side || !action) return;
    const { step, phase } = action;
    if (phase === 'attack' && step.attacker === side) {
      offset.set(withSequence(
        withTiming(side === 'player' ? 18 : -18, { duration: 140 }),
        withTiming(0, { duration: 160 }),
      ));
    }
    const lostHp = step.attacker === side ? step.recoil : step.damage;
    if (phase === 'damage' && lostHp > 0) {
      offset.set(withSequence(
        withTiming(-6, { duration: 70 }), withTiming(6, { duration: 70 }),
        withTiming(-6, { duration: 70 }), withTiming(0, { duration: 70 }),
      ));
      opacity.set(withSequence(
        withTiming(0.25, { duration: 90 }), withTiming(1, { duration: 90 }),
        withTiming(0.25, { duration: 90 }), withTiming(1, { duration: 90 }),
      ));
    }
    if (phase === 'faint' && hp === 0) {
      opacity.set(withTiming(0, { duration: 450 }));
      fall.set(withTiming(24, { duration: 450 }));
    }
  }, [action, side, hp, offset, opacity, fall]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label} · Lv. 50</Text>
      {pokemon.image && <Animated.Image source={{ uri: pokemon.image }} style={[styles.image, imageStyle]} accessibilityLabel={pokemon.name} />}
      <Text style={styles.name}>{pokemon.name.replaceAll('-', ' ')}</Text>
      <Text style={styles.label}>{pokemon.types.join(' / ')}</Text>
      {hp !== undefined && (
        <>
          <View style={styles.track} accessibilityLabel={`${hp} of ${pokemon.hp} HP`}>
            <Animated.View style={[styles.health, healthStyle]} />
          </View>
          <Text style={styles.label}>{hp} / {pokemon.hp} HP</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: Spacing.three, gap: Spacing.two, backgroundColor: Colors.card, borderRadius: Radius.medium, alignItems: 'center' },
  image: { width: 88, height: 88, resizeMode: 'contain' },
  name: { color: Colors.text, fontSize: 18, fontWeight: '700', textTransform: 'capitalize', textAlign: 'center' },
  label: { color: Colors.muted, fontSize: 14, textAlign: 'center' },
  track: { width: '100%', height: 10, borderRadius: Radius.small, backgroundColor: Colors.healthTrack, overflow: 'hidden' },
  health: { height: '100%', backgroundColor: Colors.health },
});
