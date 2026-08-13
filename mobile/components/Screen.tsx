import type { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#150D26' },
  content: { padding: 22, paddingBottom: 34, gap: 20 },
});
