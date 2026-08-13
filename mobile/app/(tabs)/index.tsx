import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { MysticalButton } from '../../components/MysticalButton';
import { Screen } from '../../components/Screen';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>✦ LE SETTE LUCI ASTRALI ✦</Text>
        <Text style={styles.title}>L'Oracolo{`\n`}di Belline</Text>
        <Text style={styles.intro}>
          Una lettura intima delle 52 Luci, per ascoltare ciò che si muove dentro e intorno a te.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>IL TUO CAMMINO</Text>
        <Text style={styles.cardTitle}>Comincia da una domanda.</Text>
        <Text style={styles.cardBody}>
          Scegli la stesa che ti chiama. Le carte arrivano una alla volta, come luci nel crepuscolo.
        </Text>
        <Link href="/(tabs)/belline" asChild>
          <MysticalButton>Consulta le Luci</MysticalButton>
        </Link>
      </View>

      <View style={styles.quote}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>La domanda apre la porta. La Luce mostra il cammino.</Text>
      </View>

      <View style={styles.plansSection}>
        <Text style={styles.plansKicker}>✦ SCEGLI IL TUO CAMMINO</Text>
        <Text style={styles.plansTitle}>Scopri gli abbonamenti</Text>
        <Text style={styles.plansIntro}>Inizia gratuitamente, oppure apri un percorso più ampio con le Luci.</Text>
        <View style={styles.planPreviewList}>
          <View style={styles.planPreview}>
            <View><Text style={styles.planName}>Free</Text><Text style={styles.planFeature}>4 crediti ogni giorno · 5 letture</Text></View>
            <Text style={styles.planPrice}>0€</Text>
          </View>
          <View style={[styles.planPreview, styles.planPreviewRecommended]}>
            <View><Text style={styles.planName}>Club</Text><Text style={styles.planFeature}>120 crediti · Carta Blu inclusa</Text></View>
            <Text style={styles.planPrice}>6,90€</Text>
          </View>
          <View style={styles.planPreview}>
            <View><Text style={styles.planName}>Lettore Esperto</Text><Text style={styles.planFeature}>300 crediti · follow-up illimitati</Text></View>
            <Text style={styles.planPrice}>14,90€</Text>
          </View>
        </View>
        <Link href="/(tabs)/upgrade" asChild>
          <MysticalButton secondary>Vedi i dettagli dei piani</MysticalButton>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 20, gap: 14 },
  kicker: { color: '#D7A93E', letterSpacing: 2.2, fontSize: 11, fontWeight: '700' },
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 42, lineHeight: 47 },
  intro: { color: '#C9BDD4', fontSize: 17, lineHeight: 26, maxWidth: 360 },
  card: { backgroundColor: '#25163B', borderColor: '#6E4E38', borderWidth: 1, borderRadius: 24, padding: 22, gap: 14 },
  cardEyebrow: { color: '#F4C95D', fontSize: 11, letterSpacing: 1.7, fontWeight: '700' },
  cardTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 26 },
  cardBody: { color: '#C9BDD4', fontSize: 15, lineHeight: 23 },
  quote: { padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  quoteMark: { color: '#B8860B', fontFamily: 'Georgia', fontSize: 44, lineHeight: 40 },
  quoteText: { color: '#A99DBA', fontFamily: 'Georgia', fontSize: 15, fontStyle: 'italic', flex: 1 },
  plansSection: { backgroundColor: '#211337', borderRadius: 24, padding: 20, gap: 12 },
  plansKicker: { color: '#D7A93E', letterSpacing: 1.5, fontSize: 11, fontWeight: '700' },
  plansTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 25 },
  plansIntro: { color: '#C9BDD4', fontSize: 14, lineHeight: 21 },
  planPreviewList: { gap: 8 },
  planPreview: { minHeight: 60, backgroundColor: '#2B1B43', borderRadius: 14, borderWidth: 1, borderColor: '#49315F', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  planPreviewRecommended: { borderColor: '#B8860B' },
  planName: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 17 },
  planFeature: { color: '#A99DBA', fontSize: 12, marginTop: 3 },
  planPrice: { color: '#F4C95D', fontFamily: 'Georgia', fontSize: 18 },
});
