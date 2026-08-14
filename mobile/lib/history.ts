import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BellineCard } from './belline';

const STORAGE_KEY = 'belline.mobile.history.v1';
const MAX_ENTRIES = 50;

export type HistoryEntry = {
  id: string;
  date: string;
  type: string;
  reflection?: string | null;
  cards: Pick<BellineCard, 'id' | 'name' | 'series' | 'meaning' | 'polarity'>[];
};

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveReading(type: string, cards: BellineCard[], reflection?: string | null) {
  const current = await loadHistory();
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: new Date().toISOString(),
    type,
    reflection: reflection?.trim() || null,
    cards: cards.map(({ id, name, series, meaning, polarity }) => ({ id, name, series, meaning, polarity })),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...current].slice(0, MAX_ENTRIES)));
}

export async function clearHistory() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
