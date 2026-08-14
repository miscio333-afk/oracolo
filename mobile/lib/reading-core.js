const READING_INTRO = 'Buongiorno, sono Isabella, assistente di Marcel Belline. Oggi sono qui per aiutarti a vedere più chiaro. Prenditi un momento per respirare... ed iniziamo con la lettura della stesa';
const READING_OUTRO = '... e ricordati che il destino non è scritto. Le carte ti mostrano una possibilità, ma sei tu che scegli. Hai il libero arbitrio, non dimenticarlo mai.';

// Apertura e chiusura fisse di ogni lettura: le prepende/accoda sempre, senza
// duplicarle se il testo AI le contiene già.
function wrapReadingParagraphs(paragraphs) {
  const list = Array.isArray(paragraphs) ? paragraphs : [];
  const out = [];
  const first = String(list[0] || '').trim().toLowerCase();
  if (!first.startsWith('buongiorno, sono isabella')) {
    out.push(READING_INTRO);
  }
  for (const paragraph of list) {
    out.push(paragraph);
  }
  const last = String(out[out.length - 1] || '').trim().toLowerCase();
  if (!last.includes('libero arbitrio, non dimenticarlo mai')) {
    out.push(READING_OUTRO);
  }
  return out;
}

const SERIES_LABELS = {
  prime: 'Carte Prime',
  sole: 'Luce I · Sole',
  luna: 'Luce II · Luna',
  mercurio: 'Luce III · Mercurio',
  venere: 'Luce IV · Venere',
  marte: 'Luce V · Marte',
  giove: 'Luce VI · Giove',
  saturno: 'Luce VII · Saturno',
  azzurra: 'Carta Blu',
};

function seriesLabel(series) {
  return SERIES_LABELS[series] || series || 'Luce';
}

function cardId(card) {
  return card.num === null || card.num === undefined ? 'blue' : card.num;
}

function cardAdvice(card) {
  const lead = card.polarity === 'good'
    ? 'Accogli con apertura la lettura.'
    : card.polarity === 'bad'
      ? 'Fai della prudenza la tua guida.'
      : 'Osserva ciò che accade accanto a questa carta.';
  return `${lead} La serie ${seriesLabel(card.series)} porta un invito a leggere il momento con attenzione.`;
}

function findPairings(cards) {
  const found = [];
  for (let i = 0; i < cards.length - 1; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const a = cards[i];
      const b = cards[j];
      const pair = (a.pairs || []).find((item) => item.with === cardId(b))
        || (b.pairs || []).find((item) => item.with === cardId(a));
      if (!pair) continue;

      const polarities = [a.polarity, b.polarity];
      const tone = polarities.every((value) => value === 'good')
        ? 'good'
        : polarities.every((value) => value === 'bad')
          ? 'bad'
          : polarities.includes('good') && polarities.includes('bad')
            ? 'soft'
            : 'neutral';
      found.push({ a, b, note: pair.note, tone });
    }
  }
  return found;
}

function buildRuleBasedReading(cards, options = {}) {
  const drawn = Array.isArray(cards) ? cards : [];
  const question = String(options.question || '').trim();
  const normal = drawn.filter((card) => card.num !== null && card.num !== undefined);
  const goods = normal.filter((card) => card.polarity === 'good').length;
  const bads = normal.filter((card) => card.polarity === 'bad').length;
  const neutrals = normal.length - goods - bads;
  const hasBlue = drawn.some((card) => card.num === null || card.num === undefined);
  const total = normal.length || drawn.length || 1;
  const score = Math.max(1, Math.min(5, Math.round(((goods + neutrals * 0.5 + (hasBlue ? 0.75 : 0)) / total) * 5)));

  const frequency = {};
  drawn.forEach((card) => (card.keywords || []).forEach((keyword) => {
    frequency[keyword] = (frequency[keyword] || 0) + 1;
  }));
  const keywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([keyword]) => keyword);

  const seriesFrequency = {};
  drawn.forEach((card) => {
    seriesFrequency[card.series] = (seriesFrequency[card.series] || 0) + 1;
  });
  const dominantSeries = Object.entries(seriesFrequency).sort((a, b) => b[1] - a[1])[0] || null;
  const guide = ['good', 'neutral', 'bad'].map((polarity) => drawn.find((card) => card.polarity === polarity)).find(Boolean) || drawn[0] || null;
  const polarityLead = bads === 0 && goods > neutrals
    ? 'Le tue Luci sono in prevalenza favorevoli.'
    : bads > goods && bads > neutrals
      ? 'Le tue Luci chiedono soprattutto prudenza.'
      : goods === 0
        ? 'Le tue Luci descrivono un passaggio da osservare con calma.'
        : 'Le tue Luci sono in equilibrio tra slancio, passaggio e cautela.';

  const paragraphs = [];
  if (question) paragraphs.push(`Hai domandato: «${question}».`);
  paragraphs.push(`${polarityLead} La stesa porta ${goods} carta${goods === 1 ? '' : 'e'} favorevole, ${neutrals} di passaggio e ${bads} avversa.`);
  drawn.forEach((card, index) => {
    paragraphs.push(`Luce ${index + 1}, ${card.name}: ${card.meaning} ${cardAdvice(card)}`);
  });
  if (dominantSeries) paragraphs.push(`Il territorio dominante è ${seriesLabel(dominantSeries[0])}, presente con ${dominantSeries[1]} carta${dominantSeries[1] === 1 ? '' : 'e'}.`);

  const practicalAdvice = bads === 0 && goods > neutrals
    ? 'Muoviti con fiducia e cogli le occasioni che le Luci indicano: agisci in modo deciso e coerente.'
    : bads > goods && bads > neutrals
      ? 'Procedi con prudenza e lucidità: verifica ogni scelta e non forzare i tempi.'
      : 'Valuta con calma le opzioni: le Luci premiano chi decide con equilibrio e coerenza.';
  const finalAdvice = `${practicalAdvice}${guide ? ` In particolare, ${guide.name} suggerisce di osservare il prossimo passo con consapevolezza.` : ''}${hasBlue ? ' La Carta Blu offre protezione e alleggerisce le difficoltà.' : ''}`;

  return {
    paragraphs,
    practicalAdvice: finalAdvice,
    pairings: findPairings(drawn),
    guide,
    keywords,
    dominantSeries: dominantSeries ? { name: seriesLabel(dominantSeries[0]), count: dominantSeries[1] } : null,
    gauge: { goods, neutrals, bads, hasBlue, score },
    cardDetails: drawn.map((card) => ({ card, advice: cardAdvice(card) })),
  };
}

module.exports = { buildRuleBasedReading, findPairings, seriesLabel, wrapReadingParagraphs };
