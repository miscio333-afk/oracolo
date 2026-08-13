type BellineCard = {
  id: number | string;
  num: number | null;
  name: string;
  series: string;
  meaning: string;
  keywords?: string[];
  polarity?: 'good' | 'neutral' | 'bad';
  detail?: { icon?: string };
};

declare const require: (path: string) => {
  getBellineCards: (includeBlue?: boolean) => BellineCard[];
  getBellineCardById: (id: number | string) => BellineCard | null;
  bellineAdvice: (card: BellineCard) => string;
  bellinePolarityLabel: (polarity: string) => string;
  bellineSeriesName: (series: string) => string;
  bellineNatalCard: (day: number, month: number, year: number) => number;
};

// The source is copied from the web dataset so native builds remain self-contained.
const source = require('./belline-source.js');

export type { BellineCard };
export const getBellineCards = source.getBellineCards;
export const getBellineCardById = source.getBellineCardById;
export const bellineAdvice = source.bellineAdvice;
export const bellinePolarityLabel = source.bellinePolarityLabel;
export const bellineSeriesName = source.bellineSeriesName;
export const bellineNatalCard = source.bellineNatalCard;

export function drawBellineCards(count: number, includeBlue = false) {
  const deck = getBellineCards(includeBlue).sort(() => Math.random() - 0.5);
  return deck.slice(0, count);
}
