import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MysticalButton } from './MysticalButton';

export function IntroModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Questa app è una porta, non la risposta.</Text>
            <Text style={styles.body}>
              Le carte parlano, ma sei tu che ascolti. Nessun algoritmo sostituisce il tuo intuito. Prenditi un
              respiro, formula la tua domanda con calma, e ricorda: ciò che vedi in queste carte è anche ciò che
              porti dentro.
            </Text>
            <Text style={styles.muted}>Buon viaggio.</Text>
          </ScrollView>
          <View style={styles.acceptArea}>
            <MysticalButton onPress={onClose}>Comincio</MysticalButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7, 3, 15, 0.92)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 480, backgroundColor: '#FFF6E3', borderRadius: 28, padding: 24, gap: 12, maxHeight: '80%' },
  title: { color: '#4B2E83', fontFamily: 'Georgia', fontSize: 23, lineHeight: 29 },
  body: { color: '#4B2E83', fontSize: 15, lineHeight: 22 },
  muted: { color: '#7A6AA5', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  acceptArea: { marginTop: 8 },
});