import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MysticalButton } from './MysticalButton';
import { Screen } from './Screen';
import { bellineAdvice, bellineNatalCard, bellinePolarityLabel, bellineSeriesName, drawBellineCards, getBellineCardById, type BellineCard } from '../lib/belline';
import { completeReadingEntry, saveReading, updateReadingEntry } from '../lib/history';
import { buildRuleBasedReading, wrapReadingParagraphs, type RuleBasedReading } from '../lib/reading';
import { generateMobileAIGeneralMessage } from '../lib/ai';
import { useAuth } from '../lib/auth';
import { speakWithSystemVoice, stopSystemVoice, synthesizeReading } from '../lib/tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IntroModal } from './IntroModal';

const titles: Record<string, string> = {
  free: 'Stesa di Belline',
  narrative: 'Passato · Presente · Futuro',
  natal: 'La tua Carta Natale',
};

const INTRO_STORAGE_KEY = 'belline.mobile.intro.v1';

// Metro requires static require() calls for bundled assets.
const cardImages = {
  back: require('../assets/cards/card_dorso.webp'),
  blue: require('../assets/cards/card_blue.webp'),
  '1': require('../assets/cards/card_01.webp'),
  '2': require('../assets/cards/card_02.webp'),
  '3': require('../assets/cards/card_03.webp'),
  '4': require('../assets/cards/card_04.webp'),
  '5': require('../assets/cards/card_05.webp'),
  '6': require('../assets/cards/card_06.webp'),
  '7': require('../assets/cards/card_07.webp'),
  '8': require('../assets/cards/card_08.webp'),
  '9': require('../assets/cards/card_09.webp'),
  '10': require('../assets/cards/card_10.webp'),
  '11': require('../assets/cards/card_11.webp'),
  '12': require('../assets/cards/card_12.webp'),
  '13': require('../assets/cards/card_13.webp'),
  '14': require('../assets/cards/card_14.webp'),
  '15': require('../assets/cards/card_15.webp'),
  '16': require('../assets/cards/card_16.webp'),
  '17': require('../assets/cards/card_17.webp'),
  '18': require('../assets/cards/card_18.webp'),
  '19': require('../assets/cards/card_19.webp'),
  '20': require('../assets/cards/card_20.webp'),
  '21': require('../assets/cards/card_21.webp'),
  '22': require('../assets/cards/card_22.webp'),
  '23': require('../assets/cards/card_23.webp'),
  '24': require('../assets/cards/card_24.webp'),
  '25': require('../assets/cards/card_25.webp'),
  '26': require('../assets/cards/card_26.webp'),
  '27': require('../assets/cards/card_27.webp'),
  '28': require('../assets/cards/card_28.webp'),
  '29': require('../assets/cards/card_29.webp'),
  '30': require('../assets/cards/card_30.webp'),
  '31': require('../assets/cards/card_31.webp'),
  '32': require('../assets/cards/card_32.webp'),
  '33': require('../assets/cards/card_33.webp'),
  '34': require('../assets/cards/card_34.webp'),
  '35': require('../assets/cards/card_35.webp'),
  '36': require('../assets/cards/card_36.webp'),
  '37': require('../assets/cards/card_37.webp'),
  '38': require('../assets/cards/card_38.webp'),
  '39': require('../assets/cards/card_39.webp'),
  '40': require('../assets/cards/card_40.webp'),
  '41': require('../assets/cards/card_41.webp'),
  '42': require('../assets/cards/card_42.webp'),
  '43': require('../assets/cards/card_43.webp'),
  '44': require('../assets/cards/card_44.webp'),
  '45': require('../assets/cards/card_45.webp'),
  '46': require('../assets/cards/card_46.webp'),
  '47': require('../assets/cards/card_47.webp'),
  '48': require('../assets/cards/card_48.webp'),
  '49': require('../assets/cards/card_49.webp'),
  '50': require('../assets/cards/card_50.webp'),
  '51': require('../assets/cards/card_51.webp'),
  '52': require('../assets/cards/card_52.webp'),
} as const;

export function ReadingScreenContent({ type, historyHref }: { type: string; historyHref?: string }) {
  const { isConfigured: isAuthConfigured } = useAuth();
  const audioPlayer = useAudioPlayer(null);
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const title = titles[type] ?? 'Consulta le Luci';
  const [count, setCount] = useState(type === 'narrative' ? 3 : 3);
  const [includeBlue, setIncludeBlue] = useState(false);
  const [cards, setCards] = useState<BellineCard[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introAccepted, setIntroAccepted] = useState<boolean | null>(null);
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<RuleBasedReading | null>(null);
  const [aiParagraphs, setAiParagraphs] = useState<string[] | null>(null);
  const [awaitingReflection, setAwaitingReflection] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPreparingTTS, setIsPreparingTTS] = useState(false);
  const [ttsUri, setTtsUri] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const currentEntryId = useRef<string | null>(null);

  useEffect(() => {
    void AsyncStorage.getItem(INTRO_STORAGE_KEY).then((value) => {
      setIntroAccepted(value === '1');
    });
  }, []);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' });
    return () => {
      audioPlayer.pause();
      stopSystemVoice();
    };
  }, [audioPlayer]);

  function startReading() {
    if (isBreathing) return;
    if (introAccepted === false) {
      setShowIntro(true);
      return;
    }
    beginReading();
  }

  function beginReading() {
    if (type === 'natal') {
      const day = Number(birthDate.day);
      const month = Number(birthDate.month);
      const year = Number(birthDate.year);
      if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12) return;
      const natal = getBellineCardById(bellineNatalCard(day, month, year));
      if (!natal) return;
      setCards([natal]);
      setRevealed([0]);
      completeReading([natal]);
      return;
    }
    setIsBreathing(true);
    setTimeout(() => {
      setIsBreathing(false);
      const next = drawBellineCards(count, includeBlue);
      setCards(next);
      setRevealed([]);
      setReading(null);
      setAiParagraphs(null);
    }, 1600);
  }

  function closeIntro() {
    setShowIntro(false);
    setIntroAccepted(true);
    void AsyncStorage.setItem(INTRO_STORAGE_KEY, '1');
    beginReading();
  }

  function applyAiMessage(drawnCards: BellineCard[], paragraphs: string[] | null) {
    if (currentEntryId.current) {
      const advice = paragraphs && paragraphs.length
        ? wrapReadingParagraphs(paragraphs).join('\n')
        : wrapReadingParagraphs(buildRuleBasedReading(drawnCards, { question }).paragraphs).join('\n');
      void completeReadingEntry(currentEntryId.current, advice);
    }
    if (paragraphs) setAiParagraphs(wrapReadingParagraphs(paragraphs));
  }

  function completeReading(drawnCards: BellineCard[]) {
    const rule = buildRuleBasedReading(drawnCards, { question });
    rule.paragraphs = wrapReadingParagraphs(rule.paragraphs);
    setReading(rule);
    setAiParagraphs(null);
    setTtsUri(null);
    setTtsError(null);
    audioPlayer.pause();
    stopSystemVoice();
    if (type === 'natal') {
      void saveReading(type ?? 'free', drawnCards, null, question).then((id) => {
        currentEntryId.current = id;
        if (!isAuthConfigured) return;
        setIsGeneratingAI(true);
        void generateMobileAIGeneralMessage(drawnCards, { question, type: type ?? 'free' })
          .then((paragraphs) => applyAiMessage(drawnCards, paragraphs))
          .finally(() => setIsGeneratingAI(false));
      });
      return;
    }
    setAwaitingReflection(true);
    setReflection('');
    if (type !== 'natal') {
      void saveReading(type ?? 'free', drawnCards, null, question).then((id) => {
        currentEntryId.current = id;
      });
    }
  }

  function resolveReflection(reflectionText: string) {
    const text = reflectionText.trim();
    setReflection(text);
    setAwaitingReflection(false);
    if (!cards.length) return;
    if (currentEntryId.current) {
      void updateReadingEntry(currentEntryId.current, { reflection: text || null });
    }
    if (!isAuthConfigured) return;
    setIsGeneratingAI(true);
    void generateMobileAIGeneralMessage(cards, { question, type: type ?? 'free' }, text || undefined)
      .then((paragraphs) => applyAiMessage(cards, paragraphs))
      .finally(() => setIsGeneratingAI(false));
  }

  async function handleSpeak() {
    if (!reading || isPreparingTTS) return;
    const text = (aiParagraphs || reading.paragraphs).join('\n');
    if (audioStatus.playing) {
      audioPlayer.pause();
      return;
    }
    setIsPreparingTTS(true);
    setTtsError(null);
    try {
      const uri = ttsUri || await synthesizeReading(text);
      if (uri) {
        if (!ttsUri) setTtsUri(uri);
        audioPlayer.replace(uri);
        audioPlayer.play();
      } else {
        speakWithSystemVoice(text);
      }
    } catch {
      setTtsError('La voce neurale non è disponibile: uso la voce del dispositivo.');
      speakWithSystemVoice(text);
    } finally {
      setIsPreparingTTS(false);
    }
  }

  function toggleCard(index: number) {
    setRevealed((current) => {
      if (current.includes(index)) return current;
      const next = [...current, index];
      if (next.length === cards.length && cards.length > 0) {
        completeReading(cards);
      }
      return next;
    });
  }

  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Formula una domanda nel tuo cuore, poi lascia che le Luci si dispongano.</Text>
      {historyHref && (
        <Link href={historyHref} asChild>
          <Pressable style={({ pressed }) => [styles.historyLink, pressed && styles.cardPressed]}>
            <Text style={styles.historyLinkText}>Vedi lo storico di questa stesa  ›</Text>
          </Pressable>
        </Link>
      )}
      {type !== 'natal' && (
        <TextInput
          accessibilityLabel="La tua domanda"
          onChangeText={setQuestion}
          placeholder="Scrivi la tua domanda (facoltativo)"
          placeholderTextColor="#8F819F"
          style={styles.questionInput}
          value={question}
        />
      )}
      {type === 'free' && (
        <View style={styles.options}>
          <Text style={styles.optionLabel}>NUMERO DI LUCI</Text>
          <View style={styles.optionRow}>
            {[1, 3, 7].map((value) => (
              <Pressable
                accessibilityRole="button"
                key={value}
                onPress={() => setCount(value)}
                style={[styles.option, count === value && styles.optionSelected]}
              >
                <Text style={[styles.optionText, count === value && styles.optionTextSelected]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: includeBlue }} onPress={() => setIncludeBlue((current) => !current)} style={styles.blueOption}>
            <Text style={styles.checkbox}>{includeBlue ? '☑' : '☐'}</Text>
            <Text style={styles.blueText}>Includi la Carta Blu, protezione suprema</Text>
          </Pressable>
        </View>
      )}
      {type === 'natal' && (
        <View style={styles.options}>
          <Text style={styles.optionLabel}>DATA DI NASCITA</Text>
          <View style={styles.dateRow}>
            {(['day', 'month', 'year'] as const).map((part) => (
              <TextInput
                accessibilityLabel={part === 'day' ? 'Giorno' : part === 'month' ? 'Mese' : 'Anno'}
                key={part}
                keyboardType="number-pad"
                maxLength={part === 'year' ? 4 : 2}
                onChangeText={(value) => setBirthDate((current) => ({ ...current, [part]: value.replace(/\D/g, '') }))}
                placeholder={part === 'day' ? 'GG' : part === 'month' ? 'MM' : 'AAAA'}
                placeholderTextColor="#8F819F"
                style={[styles.dateInput, part === 'year' && styles.yearInput]}
                value={birthDate[part]}
              />
            ))}
          </View>
        </View>
      )}
      {cards.length === 0 ? (
        <View style={styles.deck}>
          <Text style={styles.deckSymbol}>✦</Text>
          <Text style={styles.deckLabel}>IL MAZZO TI ASPETTA</Text>
        </View>
      ) : (
        <View style={styles.cards}>
          {cards.map((card, index) => {
            const isRevealed = revealed.includes(index);
            return (
              <Pressable
                accessibilityRole="button"
                key={String(card.id)}
                onPress={() => toggleCard(index)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <Image
                  accessibilityLabel={isRevealed ? card.name : 'Dorso della carta'}
                  source={isRevealed ? cardImages[String(card.id) as keyof typeof cardImages] : cardImages.back}
                  style={styles.cardImage}
                />
                {isRevealed ? (
                  <View style={styles.cardContent}>
                    <Text style={styles.cardNumber}>LUCE {index + 1}</Text>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardMeta}>{bellinePolarityLabel(card.polarity ?? 'neutral')} · {bellineSeriesName(card.series)}</Text>
                    <Text style={styles.cardMeaning}>{card.meaning}</Text>
                    <Text style={styles.cardAdvice}>{bellineAdvice(card)}</Text>
                  </View>
                ) : (
                  <View style={styles.cardBackContent}>
                    <Text style={styles.cardBackSymbol}>✦</Text>
                    <Text style={styles.cardBackLabel}>TOCCA PER SVELARE</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
      {isBreathing && (
        <View style={styles.breathPanel}>
          <Text style={styles.breathSymbol}>✦</Text>
          <Text style={styles.breathTitle}>Respira</Text>
          <Text style={styles.breathBody}>Inspira lentamente, trattieni un istante, poi lascia andare. Le Luci attendono il tuo respiro.</Text>
        </View>
      )}
      <IntroModal visible={showIntro} onClose={closeIntro} />
      <MysticalButton onPress={startReading}>{cards.length ? 'Nuova consultazione' : 'Inizia la consultazione'}</MysticalButton>
      {cards.length > 0 && revealed.length < cards.length && <Text style={styles.hint}>Svela ogni Luce con un tocco.</Text>}
      {cards.length > 0 && revealed.length === cards.length && <Text style={styles.complete}>✦ Tutte le Luci sono state rivelate.</Text>}
      {awaitingReflection && (
        <View style={styles.reflectionPanel}>
          <Text style={styles.reflectionEyebrow}>✦ UN ISTANTE DI ASCOLTO ✦</Text>
          <Text style={styles.reflectionTitle}>Cosa ti suscita questa lettura?</Text>
          <Text style={styles.reflectionHint}>
            Prima di leggere il messaggio, fermati un momento. Scrivi ciò che senti: le tue parole si aggiungeranno alla lettura. Oppure salta e ascolta subito.
          </Text>
          <TextInput
            accessibilityLabel="La tua riflessione sulla lettura"
            maxLength={600}
            multiline
            onChangeText={setReflection}
            placeholder="Le tue impressioni, le emozioni, ciò che queste luci ti richiamano…"
            placeholderTextColor="#8F819F"
            style={styles.reflectionInput}
            value={reflection}
          />
          <MysticalButton onPress={() => resolveReflection(reflection)}>Scrivi e ascolta il messaggio</MysticalButton>
          <MysticalButton onPress={() => resolveReflection('')} secondary>Salta e ascolta il messaggio</MysticalButton>
        </View>
      )}
      {reading && !awaitingReflection && <ReadingResult aiParagraphs={aiParagraphs} isGeneratingAI={isGeneratingAI} isPreparingTTS={isPreparingTTS} isPlaying={audioStatus.playing} onSpeak={handleSpeak} reading={reading} reflection={reflection} ttsError={ttsError} />}
      <Text style={styles.note}>La sincronizzazione dello storico e il consumo crediti server-side verranno collegati nel prossimo incremento.</Text>
    </Screen>
  );
}

function ReadingResult({ reading, aiParagraphs, isGeneratingAI, isPreparingTTS, isPlaying, onSpeak, ttsError, reflection }: { reading: RuleBasedReading; aiParagraphs: string[] | null; isGeneratingAI: boolean; isPreparingTTS: boolean; isPlaying: boolean; onSpeak: () => void; ttsError: string | null; reflection: string }) {
  const paragraphs = aiParagraphs || reading.paragraphs;
  return (
    <View style={styles.readingResult}>
      <Text style={styles.readingEyebrow}>✦ IL MESSAGGIO DELLE LUCI</Text>
      <Text style={styles.readingTitle}>{aiParagraphs ? 'Il messaggio delle Luci' : 'La lettura prende forma'}</Text>
      {reflection.trim() ? (
        <View style={styles.derivedCard}>
          <Text style={styles.derivedTitle}>La tua riflessione</Text>
          <Text style={styles.derivedText}>«{reflection.trim()}»</Text>
        </View>
      ) : null}
      {isGeneratingAI && <Text style={styles.aiStatus}>Le Luci stanno componendo un messaggio più profondo…</Text>}
      {ttsError && <Text style={styles.ttsError}>{ttsError}</Text>}
      <MysticalButton onPress={onSpeak} secondary>{isPreparingTTS ? 'Preparazione voce…' : isPlaying ? 'Interrompi voce' : 'Ascolta il messaggio'}</MysticalButton>
      {paragraphs.map((paragraph, index) => (
        <View key={paragraph} style={styles.paragraphCard}>
          <Text style={styles.paragraphTitle}>
            {index === 0 ? 'Saluto' : index > 0 && index === paragraphs.length - 1 ? 'Chiusura' : index === 1 ? 'Esordio' : index === 2 ? 'Panorama' : `Luce ${index - 1}`}
          </Text>
          <Text style={styles.paragraphText}>{paragraph}</Text>
        </View>
      ))}
      <View style={styles.derivedCard}>
        <Text style={styles.derivedTitle}>Indice di propiziazione</Text>
        <Text style={styles.score}>{reading.gauge.score} / 5</Text>
        <Text style={styles.derivedText}>
          {reading.gauge.goods} favorevoli · {reading.gauge.neutrals} di passaggio · {reading.gauge.bads} avverse
        </Text>
        {reading.dominantSeries && <Text style={styles.derivedText}>Serie dominante: {reading.dominantSeries.name}</Text>}
      </View>
      {reading.keywords.length > 0 && (
        <View style={styles.derivedCard}>
          <Text style={styles.derivedTitle}>Parole chiave</Text>
          <Text style={styles.derivedText}>{reading.keywords.join(' · ')}</Text>
        </View>
      )}
      {reading.pairings.length > 0 && (
        <View style={styles.derivedCard}>
          <Text style={styles.derivedTitle}>Abbinamenti tra le Luci</Text>
          {reading.pairings.map((pair) => <Text key={`${pair.a.id}-${pair.b.id}`} style={styles.derivedText}>{pair.a.name} e {pair.b.name}: {pair.note}</Text>)}
        </View>
      )}
      <View style={styles.adviceCard}>
        <Text style={styles.derivedTitle}>Consiglio pratico</Text>
        <Text style={styles.adviceText}>{reading.practicalAdvice}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: '#F8F4E3', fontFamily: 'Georgia', fontSize: 32, marginTop: 20 },
  subtitle: { color: '#C9BDD4', fontSize: 16, lineHeight: 24 },
  historyLink: { minHeight: 44, justifyContent: 'center' },
  historyLinkText: { color: '#F4C95D', fontSize: 14, fontWeight: '700' },
  questionInput: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: '#6E4E38', color: '#FFF9E8', paddingHorizontal: 16, fontSize: 16 },
  options: { backgroundColor: '#211337', borderRadius: 20, padding: 18, gap: 12 },
  optionLabel: { color: '#F4C95D', letterSpacing: 1.5, fontSize: 11, fontWeight: '700' },
  optionRow: { flexDirection: 'row', gap: 10 },
  option: { minWidth: 52, minHeight: 48, borderRadius: 24, borderColor: '#6E4E38', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  optionSelected: { backgroundColor: '#B8860B', borderColor: '#F4C95D' },
  optionText: { color: '#F8F4E3', fontSize: 17, fontWeight: '700' },
  optionTextSelected: { color: '#1A1028' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInput: { minHeight: 52, flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#6E4E38', color: '#FFF9E8', paddingHorizontal: 14, fontSize: 16, textAlign: 'center' },
  yearInput: { flex: 1.5 },
  blueOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { color: '#F4C95D', fontSize: 24 },
  blueText: { color: '#C9BDD4', fontSize: 14, flex: 1 },
  deck: { minHeight: 270, borderRadius: 26, backgroundColor: '#2B1B43', borderColor: '#80602A', borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  deckSymbol: { color: '#F4C95D', fontSize: 54 },
  deckLabel: { color: '#D7A93E', letterSpacing: 2.2, fontSize: 12, fontWeight: '700' },
  cards: { gap: 12 },
  card: { minHeight: 190, borderRadius: 22, backgroundColor: '#2B1B43', borderWidth: 1, borderColor: '#80602A', overflow: 'hidden' },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  cardImage: { width: '100%', aspectRatio: 0.66, backgroundColor: '#211337' },
  cardContent: { padding: 18, gap: 8 },
  cardBackContent: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, alignItems: 'center', backgroundColor: 'rgba(21, 13, 38, 0.76)', gap: 4 },
  cardBackSymbol: { color: '#F4C95D', fontSize: 42, textAlign: 'center' },
  cardBackLabel: { color: '#D7A93E', letterSpacing: 1.8, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  cardNumber: { color: '#D7A93E', letterSpacing: 1.4, fontSize: 11, fontWeight: '700' },
  cardName: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 25 },
  cardMeta: { color: '#F4C95D', fontSize: 13 },
  cardMeaning: { color: '#C9BDD4', fontSize: 15, lineHeight: 22 },
  cardAdvice: { color: '#E7D39A', fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
  hint: { color: '#A99DBA', textAlign: 'center', fontSize: 14 },
  complete: { color: '#C8E0B2', textAlign: 'center', fontSize: 15 },
  readingResult: { backgroundColor: '#211337', borderRadius: 24, padding: 18, gap: 12 },
  readingEyebrow: { color: '#F4C95D', letterSpacing: 1.4, fontSize: 11, fontWeight: '700' },
  readingTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 26 },
  aiStatus: { color: '#A99DBA', fontSize: 13, fontStyle: 'italic' },
  ttsError: { color: '#F4C95D', fontSize: 13, lineHeight: 20 },
  paragraphCard: { borderLeftWidth: 2, borderLeftColor: '#80602A', paddingLeft: 13, gap: 5 },
  paragraphTitle: { color: '#D7A93E', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  paragraphText: { color: '#C9BDD4', fontSize: 15, lineHeight: 22 },
  derivedCard: { backgroundColor: '#2B1B43', borderRadius: 16, padding: 15, gap: 7 },
  derivedTitle: { color: '#F4C95D', fontFamily: 'Georgia', fontSize: 18 },
  score: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 30 },
  derivedText: { color: '#C9BDD4', fontSize: 14, lineHeight: 21 },
  adviceCard: { backgroundColor: '#4B3044', borderRadius: 16, padding: 15, gap: 7 },
  adviceText: { color: '#FFF2C6', fontSize: 15, lineHeight: 22 },
  note: { color: '#8F819F', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  breathPanel: { backgroundColor: '#25163B', borderRadius: 24, borderColor: '#80602A', borderWidth: 1, padding: 26, alignItems: 'center', gap: 10 },
  breathSymbol: { color: '#F4C95D', fontSize: 40 },
  breathTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 24 },
  breathBody: { color: '#C9BDD4', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  reflectionPanel: { backgroundColor: '#25163B', borderRadius: 24, borderColor: '#B8860B', borderWidth: 1, padding: 20, gap: 12 },
  reflectionEyebrow: { color: '#F4C95D', letterSpacing: 1.4, fontSize: 11, fontWeight: '700' },
  reflectionTitle: { color: '#FFF9E8', fontFamily: 'Georgia', fontSize: 22 },
  reflectionHint: { color: '#C9BDD4', fontSize: 14, lineHeight: 21 },
  reflectionInput: { minHeight: 96, borderRadius: 16, borderWidth: 1, borderColor: '#6E4E38', color: '#FFF9E8', padding: 14, fontSize: 15, lineHeight: 21, textAlignVertical: 'top' },
});
