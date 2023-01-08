export * from "./PlayingCard";
export const CARD_VALUES: CARD_VALUE[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "D",
  "E",
];
export const CardValues = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  A: "A",
  B: "B",
  D: "D",
  E: "E",
} as const;
export type CARD_VALUE = typeof CardValues[keyof typeof CardValues];
export const VALUE_SYMBOL = {
  "1": "A",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  A: "10",
  B: "J",
  D: "Q",
  E: "K",
};
export const CARD_COLORS: CARD_COLOR[] = ["A", "B", "C", "D"];
export const CardColors = {
  SPADES: "A",
  HEARTS: "B",
  DIAMONDS: "C",
  CLUBS: "D",
} as const;
export type CARD_COLOR = typeof CardColors[keyof typeof CardColors];
export const COLOR_SYMBOL = {
  A: "♠",
  B: "♥",
  C: "♦",
  D: "♣",
};
export const Difficulties = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type SPIDER_DIFFICULTY = typeof Difficulties[keyof typeof Difficulties];

export interface Vacancy {
  index: number;
  sequence: number;
  color: CARD_COLOR;
  value: CARD_VALUE;
}

export interface Move extends Hint, MoveContext {
  turned?: string;
  isDeal?: boolean;
}

export interface MoveContext {
  vacancies: Vacancy[];
  vacancyIndex: number;
  lastMoved: string;
}

export interface Hint {
  from: number;
  to: number;
  uuid: string;
  length?: number;
}
