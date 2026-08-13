import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';

const plans = [
  {
    key: 'free',
    title: 'Free',
    price: '0€',
    period: 'per sempre',
    badge: undefined,
    note: 'Per iniziare ad ascoltare le Luci.',
    features: ['4 crediti ogni giorno', 'Carta Natale gratis', '5 letture nello storico'],
  },
  {
    key: 'club',
    title: 'Club',
    price: '6,90€',
    period: 'al mese',
    badge: 'CONSIGLIATO',
    note: 'Per chi legge ogni giorno.',
    features: ['120 crediti al mese', 'Storico illimitato', 'Carta Blu inclusa', 'Ascolta il messaggio con voce AI'],
  },
  {
    key: 'expert',
    title: 'Lettore Esperto',
    price: '14,90€',
    period: 'al mese',
    badge: undefined,
    note: 'Il cammino completo per chi non si ferma mai.',
    features: ['300 crediti al mese', 'Follow-up illimitati', 'Ascolta il messaggio con voce AI'],
  },
] as const;

export default function PlansScreen() {
  return (
    <Screen>
      <Text style={styles.kicker}>✦ SCEGLI IL TUO CAMMINO</Text>
      <Text style={styles.title}>I Piani del Cammino</Text>
      <Text style={styles.intro}>
        L’Oracolo di Belline è gratuito ogni giorno. Quando senti il richiamo delle Luci, puoi aprire un percorso più ampio.
      </Text>

      <View style={styles.list}>
        {plans.map((plan) => (
          <View key={plan.key} style={[styles.plan, plan.key === 'club' && styles.recommended]}>
            {plan.badge && <Text style={styles.badge}>{plan.badge}</Text>}
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>
            <View style={styles.featureList}>
              {plan.features.map((feature) => (
                <Text key={feature} style={styles.feature}>✦  {feature}</Text>
              ))}
            </View>
            <Text style={styles.note}>{plan.note}</Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>{plan.key === 'free' ? 'Piano attuale' : 'Disponibile prossimamente'}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.explainer}>
        <Text style={styles.explainerTitle}>Cosa cambia per te</Text>
        <Text style={styles.explainerText}>Ascolta il messaggio con la voce AI neurale o con la voce del dispositivo.</Text>
        <Text style={styles.explainerText}>Il Free conserva le ultime 5 letture; i piani paganti avranno storico illimitato.</Text>
        <Text style={styles.explainerText}>Gli acquisti in app verranno attivati dopo la configurazione degli store.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: '#D7A93E', letterSpacing: 1.8, fontSize: 11, fontWeight: '700', marginTop: 20 },
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 32, marginTop: 10 },
  intro: { color: '#C9BDD4', fontSize: 16, lineHeight: 24, marginTop: 4 },
  list: { gap: 14, marginTop: 8 },
  plan: { backgroundColor: '#25163B', borderRadius: 22, borderWidth: 1, borderColor: '#49315F', padding: 20, gap: 13 },
  recommended: { borderColor: '#B8860B', borderWidth: 2 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#B8860B', color: '#1A1028', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  planTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 25 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { color: '#F4C95D', fontFamily: 'Georgia', fontSize: 32 },
  period: { color: '#A99DBA', fontSize: 14 },
  featureList: { gap: 8 },
  feature: { color: '#E6DCC5', fontSize: 15, lineHeight: 21 },
  note: { color: '#A99DBA', fontSize: 13, fontStyle: 'italic' },
  comingSoon: { minHeight: 48, borderRadius: 24, borderWidth: 1, borderColor: '#80602A', alignItems: 'center', justifyContent: 'center' },
  comingSoonText: { color: '#D7A93E', fontSize: 14, fontWeight: '700' },
  explainer: { backgroundColor: '#211337', borderRadius: 20, padding: 20, gap: 10, marginTop: 4 },
  explainerTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 21 },
  explainerText: { color: '#C9BDD4', fontSize: 14, lineHeight: 21 },
});
