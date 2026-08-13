import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export function MysticalButton({ children, onPress, secondary = false }: {
  children: ReactNode;
  onPress?: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, pressed && styles.pressed]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8860B',
  },
  secondary: { backgroundColor: '#2B1B43', borderWidth: 1, borderColor: '#80602A' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  label: { color: '#1A1028', fontSize: 16, fontWeight: '700' },
  secondaryLabel: { color: '#F8F4E3' },
});
