import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BellineCard } from './belline';
import { supabase } from './supabase';

const STORAGE_KEY = 'belline.mobile.history.v1';
const PENDING_KEY = 'belline.mobile.pendingReadings.v1';
const MAX_ENTRIES = 50;

export type HistoryEntry = {
  id: string;
  date: string;
  type: string;
  reflection?: string | null;
  question?: string | null;
  advice?: string | null;
  status?: 'drawn' | 'complete';
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

export async function saveReading(type: string, cards: BellineCard[], reflection?: string | null, question?: string | null): Promise<string> {
  const current = await loadHistory();
  const entry: HistoryEntry = {
    id: clientUuid(),
    date: new Date().toISOString(),
    type,
    reflection: reflection?.trim() || null,
    question: question?.trim() || null,
    status: 'drawn',
    cards: cards.map(({ id, name, series, meaning, polarity }) => ({ id, name, series, meaning, polarity })),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...current].slice(0, MAX_ENTRIES)));
  await pushReadingToServer(entry);
  return entry.id;
}

// Aggiorna una lettura già salvata con il messaggio AI completato.
export async function completeReadingEntry(id: string, advice: string) {
  const current = await loadHistory();
  const next = current.map((e) => (e.id === id ? { ...e, advice, status: 'complete' as const } : e));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  const entry = next.find((e) => e.id === id);
  if (entry) await pushReadingToServer(entry);
}

// Aggiorna riflessione/domanda su una lettura esistente (senza creare duplicati).
export async function updateReadingEntry(id: string, patch: { reflection?: string | null; question?: string | null }) {
  const current = await loadHistory();
  const next = current.map((e) =>
    e.id === id
      ? { ...e, reflection: patch.reflection !== undefined ? patch.reflection?.trim() || null : e.reflection, question: patch.question !== undefined ? patch.question?.trim() || null : e.question }
      : e,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  const entry = next.find((e) => e.id === id);
  if (entry) await pushReadingToServer(entry);
}

// ---- Sync verso Supabase (Database Esperienziale) ----
// Fire-and-forget con coda persistente: se il client non è pronto o il server
// non risponde, la lettura viene accodata e inviata al prossimo flush.

async function loadPending(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function savePending(list: HistoryEntry[]) {
  try {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function clientUuid(): string {
  try {
    const cryptoObj = globalThis.crypto as Crypto | undefined;
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID();
  } catch {
    /* fallback sotto */
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function flushPendingReadings(): Promise<void> {
  const pending = await loadPending();
  if (!pending.length || !supabase) return;
  const kept: HistoryEntry[] = [];
  for (const entry of pending) {
    const ok = await sendReadingToServer(entry);
    if (!ok) kept.push(entry);
  }
  await savePending(kept);
}

async function sendReadingToServer(entry: HistoryEntry): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return false;
  const payload = {
    id: entry.id,
    user_id: userId,
    created_at: entry.date,
    question: entry.question || null,
    count: entry.cards.length,
    blue: false,
    cards: entry.cards.map((c) => c.name),
    advice: entry.advice || '',
    reflection: entry.reflection || null,
    ambito: null,
    type: entry.type || null,
    status: entry.status || 'drawn',
  };
  const { error } = await supabase.from('readings').upsert(payload, { onConflict: 'id' });
  return !error;
}

async function pushReadingToServer(entry: HistoryEntry): Promise<void> {
  if (!supabase) {
    const pending = await loadPending();
    pending.push(entry);
    await savePending(pending);
    return;
  }
  const ok = await sendReadingToServer(entry);
  if (!ok) {
    const pending = await loadPending();
    pending.push(entry);
    await savePending(pending);
  }
}

export async function clearHistory() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
