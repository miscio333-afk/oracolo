import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';

const readings = [
  { type: 'free', title: 'Stesa di Belline', body: 'Una domanda, da una a sette Luci, e la Carta Blu se desideri protezione.', accent: '#B8860B' },
  { type: 'narrative', title: 'Passato · Presente · Futuro', body: 'Tre Luci raccontano il tuo cammino in luce della Carta Natale.', accent: '#7D5068' },
  { type: 'natal', title: 'La tua Carta Natale', body: 'Scopri la Luce che ti accompagna dalla nascita.', accent: '#4A6741' },
] as const;

export default function ConsultaScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Scegli la tua stesa</Text>
      <Text style={styles.subtitle}>Ogni consultazione comincia da un momento di ascolto.</Text>
      <View style={styles.list}>
        {readings.map((reading) => (
          <Link key={reading.type} href={{ pathname: '/reading/[type]', params: { type: reading.type } }} asChild>
            <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
              <View style={[styles.item, { borderLeftColor: reading.accent }]}>
                <Text style={styles.itemTitle}>{reading.title}</Text>
                <Text style={styles.itemBody}>{reading.body}</Text>
                <Text style={styles.itemAction}>Apri la stesa  ›</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 32, marginTop: 20 },
  subtitle: { color: '#C9BDD4', fontSize: 16, lineHeight: 24 },
  list: { gap: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  item: { backgroundColor: '#25163B', borderRadius: 18, borderLeftWidth: 4, padding: 20, gap: 9 },
  itemTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 22 },
  itemBody: { color: '#C9BDD4', fontSize: 15, lineHeight: 22 },
  itemAction: { color: '#F4C95D', fontSize: 15, fontWeight: '700', marginTop: 4 },
});
