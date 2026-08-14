import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth';
import { IntroGateway } from '../components/IntroGateway';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#150D26' },
          headerTintColor: '#F8F4E3',
          headerTitleStyle: { fontFamily: 'Georgia', fontSize: 18 },
          contentStyle: { backgroundColor: '#150D26' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: 'Accedi', presentation: 'modal' }} />
        <Stack.Screen name="plans" options={{ title: 'I Piani del Cammino' }} />
        <Stack.Screen name="reading/[type]" options={{ title: 'Consulta le Luci' }} />
      </Stack>
      <IntroGateway />
    </AuthProvider>
  );
}
