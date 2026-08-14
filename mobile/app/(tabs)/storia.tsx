import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { MysticalButton } from '../../components/MysticalButton';
import { Screen } from '../../components/Screen';

export default function StoriaScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>✦ LA STORIA DEL MAZZO ✦</Text>
        <Text style={styles.title}>L'Oracolo di Belline</Text>
        <Text style={styles.intro}>
          Un omaggio alle 52 Luci che ti accompagnano: le loro origini documentate, dalla mano del Mage
          Edmond alla riscoperta di Belline.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>ORIGINI</Text>
        <Text style={styles.cardTitle}>Un mazzo nato a metà Ottocento</Text>
        <Text style={styles.body}>
          Le origini dell'oracolo sono attribuite al Mage Edmond, pseudonimo del francese{' '}
          <Text style={styles.highlight}>Jules Charles Ernest Billaudot</Text> (1829–1881). I disegni delle
          carte videro la luce tra il 1845 e il 1865: un insieme di simboli pensato per la divinazione,
          ispirato al clima esoterico dell'epoca e alle corrispondenze astrali. Dopo la sua morte nel 1881,
          il mazzo cadde nell'oblio per quasi un secolo.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>LA RISCOPERTA</Text>
        <Text style={styles.cardTitle}>Marcel Forget, detto Belline</Text>
        <Text style={styles.body}>
          A riportare le carte alla luce fu il cartomante francese <Text style={styles.highlight}>Marcel Forget</Text>{' '}
          (1924–1977), noto con il nome d'arte di <Text style={styles.highlight}>Belline</Text>. Ritrovò i prototipi
          tra gli effetti di una sua consultante, li rielaborò e diede loro un'interpretazione unitaria.
        </Text>
        <Text style={styles.body}>
          Le prime edizioni pubbliche risalgono al <Text style={styles.highlight}>1960</Text> (La Ducale) e al{' '}
          <Text style={styles.highlight}>1961</Text> (Grimaud), che battezzò il mazzo con il nome del suo
          riscopritore. Da allora ha conosciuto decine di edizioni e una popolarità che dura ancora oggi.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>LA STRUTTURA</Text>
        <Text style={styles.cardTitle}>Le 52 Luci e la Carta Blu</Text>
        <Text style={styles.body}>
          L'oracolo è composto da <Text style={styles.highlight}>52 carte</Text>, più la{' '}
          <Text style={styles.highlight}>Carta Blu</Text>. Le 52 sono ripartite in{' '}
          <Text style={styles.highlight}>7 serie astrali</Text>, ciascuna governata da un corpo celeste:
        </Text>
        <Text style={styles.body}>☉ Sole · ☽ Luna · ☿ Mercurio · ♀ Venere · ♂ Marte · ♃ Giove · ♄ Saturno</Text>
        <Text style={styles.body}>
          A fianco delle 49 carte legate alle serie astrali ci sono poche Luci senza pianeta, come la Chiave,
          l'Uomo e la Donna: figure di passaggio che parlano di scelte e di incontri.
        </Text>
        <Text style={styles.body}>
          La <Text style={styles.highlight}>Carta Blu</Text> è la carta del consultante: una presenza benevola
          che avvolge la stesa, dissolve le ombre e richiama protezione e fiducia.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>FONTI</Text>
        <Text style={styles.cardTitle}>Da dove viene questa ricostruzione</Text>
        <Text style={styles.body}>
          La ricostruzione si basa su fonti documentate sulla storia dell'oracolo: le cronache delle prime
          edizioni La Ducale (1960) e Grimaud (1961), gli studi sui prototipi del Mage Edmond (1845–1865) e i
          materiali di collezionismo sul mazzo. Le 52 carte rappresentate ne sono una riproduzione in chiave
          Art Nouveau, ispirata alle carte tradizionali.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>IL PERCHÉ DEL MAZZO</Text>
        <Text style={styles.cardTitle}>Una domanda prima di ogni riga di codice</Text>
        <Text style={styles.body}>
          Prima di costruire, un dubbio: <Text style={styles.highlight}>digitalizzare un'arte divinatoria non la
          denatura?</Text> Un'arte che nasce umana, personale, intima — legata al silenzio e al tocco delle carte —
          messa su uno schermo rischia di diventare un prodotto, un dato, una notifica.
        </Text>
        <Text style={styles.body}>
          Ma ogni epoca ha usato la tecnologia disponibile per interrogare il divino. L'app è il mazzo di carte
          del XXI secolo: il Sole, la Luna, la Casa Galante restano quelli. Ciò che conta non è la materia, ma il
          rispetto con cui la si adopera.
        </Text>
        <Text style={styles.body}>
          Da quel dubbio sono nate scelte concrete: il <Text style={styles.highlight}>disclaimer</Text> all'apertura,
          il <Text style={styles.highlight}>respiro</Text> prima di ogni tiratura, il{' '}
          <Text style={styles.highlight}>limite di consulti</Text>, e lo spazio per la{' '}
          <Text style={styles.highlight}>riflessione</Text> prima del significato.
        </Text>
        <Text style={styles.body}>
          Se l'interfaccia invita a fermarsi, a respirare, a toccare lo schermo con intenzione, allora si sta
          digitalizzando un rituale, non svuotandolo.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>IL RESPIRO DELL'OPERATORE</Text>
        <Text style={styles.quote}>“Il respiro dell'operatore vale più del materiale delle carte.”</Text>
        <Text style={styles.body}>
          L'arte divinatoria non muore perché la si mette su uno schermo. Muore quando la si usa senza
          consapevolezza. Quest'app è stata costruita con cura, come si farebbe un mazzo nuovo, e vuole ricordare
          a chi la apre di fermarsi: non uno che distrae, ma uno che invita al silenzio.
        </Text>
      </View>

      <Link href="/(tabs)/belline" asChild>
        <MysticalButton>Consulta le Luci</MysticalButton>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 20, gap: 14 },
  kicker: { color: '#D7A93E', letterSpacing: 2.2, fontSize: 11, fontWeight: '700' },
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 34, lineHeight: 40 },
  intro: { color: '#C9BDD4', fontSize: 16, lineHeight: 25, maxWidth: 380 },
  card: { backgroundColor: '#25163B', borderRadius: 24, padding: 22, gap: 12 },
  eyebrow: { color: '#F4C95D', letterSpacing: 1.7, fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 22 },
  body: { color: '#C9BDD4', fontSize: 15, lineHeight: 23 },
  highlight: { color: '#F4C95D', fontWeight: '700' },
  quote: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 17, fontStyle: 'italic', lineHeight: 25 },
});