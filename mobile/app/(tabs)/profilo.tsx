import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { MysticalButton } from '../../components/MysticalButton';
import { Screen } from '../../components/Screen';
import { isRevenueCatConfigured, isSupabaseConfigured } from '../../lib/config';
import { useAuth } from '../../lib/auth';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Il tuo Upgrade</Text>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>PIANO ATTUALE</Text>
        <Text style={styles.plan}>Luce Free</Text>
        <Text style={styles.body}>
          {session?.user.email ?? 'Accedi per conservare le letture e scoprire i percorsi Club e Lettore Esperto.'}
        </Text>
        {session ? (
          <MysticalButton secondary onPress={() => void signOut()}>Esci dall’account</MysticalButton>
        ) : (
          <Link href="/auth" asChild>
            <MysticalButton>Accedi con email</MysticalButton>
          </Link>
        )}
        <Link href="/(tabs)/upgrade" asChild>
          <MysticalButton secondary>Scopri gli abbonamenti</MysticalButton>
        </Link>
      </View>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>LA STORIA DEL MAZZO</Text>
        <Text style={styles.historyTitle}>L’Oracolo di Belline</Text>
        <Text style={styles.body}>
          I disegni sono attribuiti al Mage Edmond (Jules Charles Ernest Billaudot, 1829–1881), creati tra il
          1845 e il 1865, e riscoperti a metà del Novecento dal cartomante Marcel Forget, detto Belline
          (1924–1977). Le prime edizioni portano la firma delle case La Ducale (1960) e Grimaud (1961), che
          battezzò il mazzo con il nome del suo riscopritore.
        </Text>
        <Text style={styles.body}>
          Composto da 52 Luci più la Carta Blu, il mazzo si organizza in sette serie astrali — Sole, Luna,
          Mercurio, Venere, Marte, Giove e Saturno — ciascuna con sette carte, insieme a quattro figure
          senza pianeta, come la Chiave, l’Uomo e la Donna.
        </Text>
      </View>
      <View style={styles.status}>
        <Text style={styles.statusTitle}>Configurazione ambiente</Text>
        <Text style={styles.statusLine}>Supabase: {isSupabaseConfigured ? 'collegato' : 'da configurare'}</Text>
        <Text style={styles.statusLine}>RevenueCat: {isRevenueCatConfigured ? 'collegato' : 'da configurare'}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 32, marginTop: 20 },
  card: { backgroundColor: '#25163B', borderRadius: 24, padding: 22, gap: 14 },
  eyebrow: { color: '#F4C95D', letterSpacing: 1.7, fontSize: 11, fontWeight: '700' },
  plan: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 26 },
  historyTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 22 },
  body: { color: '#C9BDD4', fontSize: 15, lineHeight: 23 },
  status: { borderTopColor: '#49315F', borderTopWidth: 1, paddingTop: 18, gap: 8 },
  statusTitle: { color: '#F8F4E3', fontWeight: '700' },
  statusLine: { color: '#A99DBA', fontSize: 14 },
});
