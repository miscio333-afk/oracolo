const assert = require('node:assert/strict');
const test = require('node:test');
const { buildRuleBasedReading } = require('./reading-core');

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
