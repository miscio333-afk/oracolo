import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { MysticalButton } from '../components/MysticalButton';
import { Screen } from '../components/Screen';
import { useAuth } from '../lib/auth';

export default function AuthScreen() {
  const { isConfigured, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit() {
    setIsSending(true);
    setStatus(null);
    const result = await signInWithEmail(email);
    setIsSending(false);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    setStatus('Controlla la tua email: il link ti riporterà nell’app.');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Screen>
        <Text style={styles.kicker}>✦ IL TUO RITUALE PERSONALE</Text>
        <Text style={styles.title}>Accedi a Belline</Text>
        <Text style={styles.body}>
          Nessuna password. Riceverai un link sicuro per conservare le tue letture e ritrovare il tuo cammino.
        </Text>
        <View style={styles.form}>
          <Text style={styles.label}>INDIRIZZO EMAIL</Text>
          <TextInput
            accessibilityLabel="Indirizzo email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="nome@esempio.it"
            placeholderTextColor="#8F819F"
            style={styles.input}
            value={email}
          />
          <MysticalButton onPress={handleSubmit}>{isSending ? 'Invio in corso…' : 'Invia il link magico'}</MysticalButton>
        </View>
        {!isConfigured && <Text style={styles.warning}>Configura Supabase nel file `.env` per abilitare l’accesso.</Text>}
        {status && <Text style={styles.status}>{status}</Text>}
        <Text onPress={() => router.back()} style={styles.back}>Torna all’Upgrade</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#150D26' },
  kicker: { color: '#D7A93E', letterSpacing: 1.8, fontSize: 11, fontWeight: '700', marginTop: 24 },
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 34, marginTop: 12 },
  body: { color: '#C9BDD4', fontSize: 16, lineHeight: 24, marginTop: 6 },
  form: { backgroundColor: '#25163B', borderRadius: 24, padding: 20, gap: 14, marginTop: 16 },
  label: { color: '#F4C95D', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: '#6E4E38', color: '#FFF9E8', paddingHorizontal: 16, fontSize: 16 },
  warning: { color: '#F4C95D', fontSize: 14, lineHeight: 21, marginTop: 6 },
  status: { color: '#C8E0B2', fontSize: 15, lineHeight: 22, marginTop: 6 },
  back: { color: '#A99DBA', textAlign: 'center', fontSize: 15, paddingVertical: 14 },
});
