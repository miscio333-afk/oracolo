import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { loadHistory, type HistoryEntry } from '../../lib/history';

export default function HistoryScreen() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setEntries(await loadHistory());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color="#F4C95D" /></View>;
  }

  if (entries.length > 0) {
    return (
      <View style={styles.listScreen}>
        <Text style={styles.title}>Le tue letture</Text>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={entries}
          keyExtractor={(entry) => entry.id}
          onRefresh={refresh}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString('it-IT')}</Text>
              <Text style={styles.entryType}>{item.type === 'narrative' ? 'Passato · Presente · Futuro' : 'Stesa di Belline'}</Text>
              <Text style={styles.entryCards}>{item.cards.map((card) => card.name).join(' · ')}</Text>
              {item.reflection ? <Text style={styles.entryReflection}>«{item.reflection}»</Text> : null}
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Le tue letture</Text>
      <View style={styles.empty}>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.emptyTitle}>La tua storia è ancora vuota</Text>
        <Text style={styles.emptyBody}>Le consultazioni che vorrai conservare appariranno qui, pronte a essere riascoltate.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#150D26', alignItems: 'center', justifyContent: 'center' },
  listScreen: { flex: 1, backgroundColor: '#150D26', paddingHorizontal: 22, paddingTop: 28 },
  listContent: { gap: 12, paddingTop: 18, paddingBottom: 32 },
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 32, marginTop: 20 },
  empty: { backgroundColor: '#211337', borderRadius: 24, padding: 28, alignItems: 'center', gap: 12, marginTop: 20 },
  symbol: { color: '#F4C95D', fontSize: 30 },
  emptyTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 22, textAlign: 'center' },
  emptyBody: { color: '#A99DBA', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  entry: { backgroundColor: '#25163B', borderRadius: 18, borderLeftWidth: 3, borderLeftColor: '#B8860B', padding: 18, gap: 7 },
  entryDate: { color: '#A99DBA', fontSize: 12 },
  entryType: { color: '#F4C95D', fontFamily: 'Georgia', fontSize: 20 },
  entryCards: { color: '#C9BDD4', fontSize: 14, lineHeight: 21 },
  entryReflection: { color: '#E7D39A', fontSize: 13, lineHeight: 19, fontStyle: 'italic', marginTop: 2 },
});
