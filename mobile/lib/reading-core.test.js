const assert = require('node:assert/strict');
const test = require('node:test');
const { buildRuleBasedReading, wrapReadingParagraphs } = require('./reading-core');

const cards = [
  {
    id: 1,
    num: 1,
    name: 'Il Destino',
    series: 'prime',
    meaning: 'Una scelta apre il cammino.',
    polarity: 'neutral',
    keywords: ['Scelta', 'Destino'],
    pairs: [{ with: 2, note: 'Una scelta condivisa.' }],
  },
  {
    id: 2,
    num: 2,
    name: "La Stella dell'Uomo",
    series: 'prime',
    meaning: 'Forza e coraggio sostengono l’azione.',
    polarity: 'good',
    keywords: ['Coraggio', 'Protezione'],
    pairs: [],
  },
];

test('builds a complete rule-based reading from the drawn cards', () => {
  const result = buildRuleBasedReading(cards, { question: 'Come procedere?' });

  assert.equal(result.guide.name, "La Stella dell'Uomo");
  assert.equal(result.gauge.goods, 1);
  assert.equal(result.gauge.neutrals, 1);
  assert.equal(result.pairings[0].note, 'Una scelta condivisa.');
  assert.match(result.paragraphs.join(' '), /Come procedere\?/);
  assert.match(result.practicalAdvice, /fiducia|equilibrio|prudenza/i);
});

test('does not count the Carta Blu as a negative card', () => {
  const blue = {
    id: 'blue',
    num: null,
    name: 'La Carta Blu',
    series: 'azzurra',
    meaning: 'Protezione.',
    polarity: 'good',
    keywords: ['Protezione'],
    pairs: [],
  };
  const result = buildRuleBasedReading([blue], {});

  assert.equal(result.gauge.hasBlue, true);
  assert.equal(result.gauge.goods, 0);
  assert.match(result.practicalAdvice, /protezione/i);
});

test('wraps a reading with the fixed intro and outro', () => {
  const wrapped = wrapReadingParagraphs(['Primo paragrafo', 'Secondo paragrafo']);

  assert.equal(wrapped.length, 4);
  assert.match(wrapped[0], /Buongiorno, sono Isabella, assistente di Marcel Belline\./);
  assert.match(wrapped[wrapped.length - 1], /il destino non è scritto/);
  assert.equal(wrapped[1], 'Primo paragrafo');
});

test('does not duplicate intro/outro if the AI already included them', () => {
  const already = wrapReadingParagraphs([
    'Buongiorno, sono Isabella, assistente di Marcel Belline. Come va?',
    'Una lettura.',
    'Ricordati che il destino non è scritto... hai il libero arbitrio, non dimenticarlo mai.',
  ]);

  assert.equal(already.length, 3);
  assert.match(already[0], /^Buongiorno, sono Isabella/);
  assert.match(already[2], /libero arbitrio, non dimenticarlo mai/);
});

test('wraps empty or missing input with both fixed paragraphs', () => {
  const empty = wrapReadingParagraphs([]);
  assert.equal(empty.length, 2);
  assert.match(empty[0], /^Buongiorno, sono Isabella/);
  assert.match(empty[1], /il destino non è scritto/);
});
