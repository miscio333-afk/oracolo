import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { MysticalButton } from './MysticalButton';

const GATEWAY_MS = 5000;

const STAR_PATH =
  'M120 0 L134 86 L220 100 L134 114 L120 200 L106 114 L20 100 L106 86 Z';

export function IntroGateway() {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => setReady(true), GATEWAY_MS);
    return () => clearTimeout(timer);
  }, [spin, pulse]);

  function dismiss() {
    if (!ready) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const starScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={() => {}}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <View style={styles.visual}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Svg width={220} height={220} viewBox="-160 -160 560 560">
              <G opacity={0.4}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Line
                    key={i}
                    x1={0}
                    y1={-40}
                    x2={0}
                    y2={-220}
                    stroke="#FFBF00"
                    strokeOpacity={0.16}
                    strokeWidth={1.5}
                    transform={`rotate(${i * 30})`}
                  />
                ))}
              </G>
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.rings, { opacity: ringOpacity }]}>
            <Svg width={220} height={220} viewBox="-160 -160 560 560">
              <Circle cx={120} cy={120} r={100} stroke="#B8860B" strokeOpacity={0.35} strokeWidth={1.5} fill="none" />
              <Circle cx={120} cy={120} r={125} stroke="#B8860B" strokeOpacity={0.2} strokeWidth={1} fill="none" />
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.star, { transform: [{ scale: starScale }] }]}>
            <Svg width={180} height={180} viewBox="-40 -40 280 280">
              <Path d={STAR_PATH} fill="#F4C95D" fillOpacity={0.18} />
              <Path d={STAR_PATH} fill="none" stroke="#B8860B" strokeWidth={3} strokeLinejoin="round" />
              <Circle cx={120} cy={100} r={5} fill="#FFBF00" />
            </Svg>
          </Animated.View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Questa app è una porta, non la risposta.</Text>
          <Text style={styles.body}>
            Le Luci del mazzo di Belline ti accompagnano a guardare dentro di te, ma la risposta più vera resta
            sempre la tua. Niente di quanto leggi qui è destino scritto: è un invito a fermarti, riflettere e
            scegliere con consapevolezza.
          </Text>
          <Text style={styles.body}>
            Ogni consultazione è proposta{' '}
            <Text style={styles.strong}>a solo scopo di intrattenimento e riflessione personale</Text>. Non
            sostituisce in alcun modo pareri medici, psicologici, legali o finanziari.
          </Text>
          <Text style={styles.muted}>
            Destinato a un pubblico adulto (18+). Se stai attraversando un momento difficile, rivolgiti con fiducia
            a un professionista.
          </Text>
          <View style={styles.acceptArea}>
            <MysticalButton onPress={dismiss} secondary={!ready}>
              {ready ? 'Entra' : '...'}
            </MysticalButton>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 3, 15, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  visual: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  rings: { position: 'absolute', top: 0, left: 0 },
  star: { position: 'absolute', top: 20, left: 20 },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFF6E3',
    borderRadius: 28,
    padding: 24,
    gap: 12,
    maxHeight: '75%',
  },
  title: { color: '#4B2E83', fontFamily: 'Georgia', fontSize: 23, lineHeight: 29 },
  body: { color: '#4B2E83', fontSize: 15, lineHeight: 22 },
  strong: { fontWeight: '700' },
  muted: { color: '#7A6AA5', fontSize: 13, lineHeight: 20 },
  acceptArea: { marginTop: 8 },
});