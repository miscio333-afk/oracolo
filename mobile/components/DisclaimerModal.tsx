import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MysticalButton } from './MysticalButton';

const STORAGE_KEY = 'belline.mobile.disclaimer.v1';

export function DisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== '1') setVisible(true);
    });
  }, []);

  function accept() {
    void AsyncStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Questa app è una porta, non la risposta.</Text>
            <Text style={styles.body}>
              Le Luci del mazzo di Belline ti accompagnano a guardare dentro di te, ma la risposta più vera
              resta sempre la tua. Niente di quanto leggi qui è destino scritto: è un invito a fermarti,
              riflettere e scegliere con consapevolezza.
            </Text>
            <Text style={styles.body}>
              Ogni consultazione è proposta <Text style={styles.strong}>a solo scopo di intrattenimento e
              riflessione personale</Text>. Non sostituisce in alcun modo pareri medici, psicologici, legali o
              finanziari.
            </Text>
            <Text style={styles.muted}>
              Destinato a un pubblico adulto (18+). Se stai attraversando un momento difficile, rivolgiti con
              fiducia a un professionista.
            </Text>
          </ScrollView>
          <View style={styles.acceptArea}>
            <MysticalButton onPress={accept}>Ho compreso e proseguo</MysticalButton>
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
  strong: { fontWeight: '700' },
  muted: { color: '#7A6AA5', fontSize: 13, lineHeight: 20 },
  acceptArea: { marginTop: 8 },
});
