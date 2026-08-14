import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F4C95D',
        tabBarInactiveTintColor: '#A99DBA',
        tabBarStyle: {
          backgroundColor: '#211337',
          borderTopColor: '#49315F',
          height: 82,
          paddingBottom: 18,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="belline" options={{ title: 'Belline' }} />
      <Tabs.Screen name="narrativa" options={{ title: 'Narrativa' }} />
      <Tabs.Screen name="natale" options={{ title: 'Natale' }} />
      <Tabs.Screen name="upgrade" options={{ title: 'Upgrade' }} />
      <Tabs.Screen name="storia" options={{ title: 'Storia' }} />
      <Tabs.Screen name="consulta" options={{ href: null }} />
      <Tabs.Screen name="storico" options={{ href: null }} />
      <Tabs.Screen name="profilo" options={{ href: null }} />
    </Tabs>
  );
}
