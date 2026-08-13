import type { BellineCard } from './belline';
import { supabase } from './supabase';

function cardDescription(card: BellineCard, index: number) {
  const polarity = card.polarity === 'good' ? 'favorevole' : card.polarity === 'bad' ? 'avversa' : 'neutra';
  const icon = card.detail?.icon ? ` Iconografia: ${card.detail.icon}.` : '';
  return `${index + 1}. ${card.name} (${polarity}, serie ${card.series}).${icon} ${card.meaning}`;
}

export function buildMobileReadingPrompt(cards: BellineCard[], question: string, type: string) {
  const focus = question.trim()
    ? `Il consultante ha posto questa domanda: «${question.trim()}».`
    : 'Il consultante non ha posto una domanda specifica: traccia un quadro generale.';
  const structure = type === 'narrative'
    ? 'Organizza la lettura come Passato, Presente e Futuro, rispettando l’ordine delle carte.'
    : 'Organizza la lettura partendo dal quadro generale e poi commenta ogni carta nell’ordine estratto.';

  return [
    'Sei un cartomante esperto dell’oracolo di Belline. Scrivi esclusivamente in italiano.',
    focus,
    structure,
    'Usa esclusivamente le carte elencate. Non inventare arcani, semi o carte assenti.',
    'Parti dall’iconografia, poi collega significato, domanda e consiglio concreto.',
    `Carte estratte (${cards.length}):`,
    cards.map(cardDescription).join('\n'),
    'Scrivi 5-7 paragrafi separati da una riga vuota. Chiudi con un consiglio pratico concreto.',
  ].join('\n\n');
}

export async function generateMobileAIGeneralMessage(cards: BellineCard[], options: { question?: string; type: string }) {
  if (!supabase || cards.length === 0) return null;
  const prompt = buildMobileReadingPrompt(cards, options.question || '', options.type);
  const request = supabase.functions.invoke('belline-ai', {
    body: {
      prompt,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 1800,
    },
  });
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 25000));
  const response = await Promise.race([request, timeout]);
  if (!response || response.error || !response.data?.text) return null;
  return String(response.data.text)
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
