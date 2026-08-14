import type { BellineCard } from './belline';

declare const require: (path: string) => {
  buildRuleBasedReading: (cards: BellineCard[], options?: { question?: string }) => RuleBasedReading;
  wrapReadingParagraphs: (paragraphs: string[]) => string[];
};

export type RuleBasedReading = {
  paragraphs: string[];
  practicalAdvice: string;
  pairings: { a: BellineCard; b: BellineCard; note: string; tone: string }[];
  guide: BellineCard | null;
  keywords: string[];
  dominantSeries: { name: string; count: number } | null;
  gauge: { goods: number; neutrals: number; bads: number; hasBlue: boolean; score: number };
  cardDetails: { card: BellineCard; advice: string }[];
};

const core = require('./reading-core.js');

export const buildRuleBasedReading = core.buildRuleBasedReading;
export const wrapReadingParagraphs = core.wrapReadingParagraphs;
