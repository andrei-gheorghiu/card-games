import { defineStore } from "pinia";
import { faker } from "@faker-js/faker";
import { isEqual, pick, sortBy } from "lodash-es";
import {
  CARD_COLORS,
  CARD_VALUES,
  CardColors,
  Difficulties,
  CARD_COLOR,
  SPIDER_DIFFICULTY,
  PlayingCard,
  Move,
  MoveContext,
  Hint,
  Vacancy,
} from "../types";
import { getNotDealt, getUuid, stutter } from "../helpers";

interface State {
  cards: PlayingCard[];
  decks: number;
  columns: string[][];
  difficulty: SPIDER_DIFFICULTY;
  vacancies: Vacancy[];
  lastMoved: string;
  vacancyIndex: number;
  moves: Move[];
  highlighted: string;
  rects: Record<string, DOMRect>;
  hints: Hint[];
  hintIndex: number;
  noHints: boolean;
}

const defaultMoveContext: MoveContext = {
  vacancies: [],
  vacancyIndex: 0,
  lastMoved: "",
};
const defaultState: State = {
  cards: [],
  decks: 2,
  columns: [...Array.from({ length: 11 }).map(() => [])],
  difficulty: "EASY",
  moves: [],
  highlighted: "",
  rects: {},
  hints: [],
  hintIndex: 0,
  noHints: false,
  ...defaultMoveContext,
};
const defaultMove: Move = {
  from: -1,
  to: -1,
  vacancies: [],
  vacancyIndex: -1,
  lastMoved: "",
  uuid: "",
};

export const useSpider = defineStore("spider", {
  state: (): State => ({
    ...defaultState,
  }),
  actions: {
    getHints() {
      if (this.hints.length) {
        this.hintIndex = (this.hintIndex + 1) % this.hints.length;
        return;
      }
      const sequenceLengths = this.activeColumns.map((_, i) =>
        this.getColumnSequenceLength(i)
      );
      this.hintIndex = 0;
      this.hints = sortBy(
        this.activeColumns
          .map((col, index) =>
            col
              .slice(col.length - this.getColumnSequenceLength(index))
              .map(this.getCard)
          )
          .reduce((acc, seq, index, arr) => {
            const last = seq[seq.length - 1];
            if (last) {
              arr
                .map((col, i) =>
                  i === index
                    ? -1
                    : col.findIndex(
                        (card) =>
                          card &&
                          CARD_VALUES.indexOf(card.value) + 1 ===
                            CARD_VALUES.indexOf(last.value)
                      )
                )
                .forEach(
                  (n, i) =>
                    n > -1 &&
                    sequenceLengths[index] - n > 0 &&
                    acc.unshift({
                      from: i,
                      to: index,
                      uuid: this.columns[i][
                        this.columns[i].length -
                          this.getColumnSequenceLength(i) +
                          n
                      ],
                      length: sequenceLengths[i] - n + sequenceLengths[index],
                    })
                );
            }
            return acc;
          }, [] as Hint[]),
        "length"
      ).reverse();
      if (!this.hints.length) {
        this.noHints = true;
      }
    },
    reverseMove() {
      const { to: from, from: to, ...rest } = this.moves[this.moves.length - 1];
      this.moveCard({ to, from, ...rest }, true);
    },
    updateRect(payload: Record<string, DOMRect | undefined>) {
      Object.assign(this.rects, payload);
    },
    resetHints() {
      Object.assign(this, {
        hints: [],
        hintIndex: 0,
        noHints: false,
      });
    },
    onCardPressed(uuid: string) {
      this.resetHints();
      const [card, vacancies, columnIndex] = [
        this.getCard(uuid),
        [] as Vacancy[],
        this.getCardColumnIndex(uuid),
      ];
      if (card && card.turned) {
        const cardValueIndex = CARD_VALUES.indexOf(card.value);
        this.activeColumns.forEach((col, index) => {
          const lastCard =
            index !== columnIndex
              ? this.getColumnCard(index)
              : this.getCard(col[col.indexOf(uuid) - 1]);
          if (
            !lastCard ||
            lastCard?.value === CARD_VALUES[cardValueIndex + 1]
          ) {
            vacancies.push({
              index,
              color: lastCard?.color || card.color,
              value: card.value,
              sequence: this.getColumnSequenceLength(index),
            });
          }
        });
        if (vacancies.length) {
          const sortedVacancies = this.sortVacancies(vacancies, card.color);
          if (
            this.lastMoved === uuid &&
            isEqual(this.vacancyMap(), this.vacancyMap(sortedVacancies))
          ) {
            this.vacancyIndex = (this.vacancyIndex + 1) % this.vacancies.length;
            this.moveCard({
              uuid,
              to: this.vacancies[this.vacancyIndex].index,
              from: this.getCardColumnIndex(uuid),
              ...this.moveContext,
            });
            return;
          }
          this.lastMoved = uuid;
          this.vacancies = this.sortVacancies(vacancies, card.color);
          this.vacancyIndex = this.vacancies[0]?.index === columnIndex ? 1 : 0;
          if (this.vacancies[this.vacancyIndex]) {
            this.moveCard({
              uuid,
              to: this.vacancies[this.vacancyIndex].index,
              from: this.getCardColumnIndex(uuid),
              ...this.moveContext,
            });
          }
        }
      }
    },
    undo(isDeal = false) {
      if (isDeal) {
        this.activeColumns.forEach((col) => {
          const card = this.getCard(col.pop());
          if (card) {
            Object.assign(card, {
              turned: false,
              dealt: false,
            });
          }
        });
      }
      return this.moves.pop();
    },
    moveCard({ uuid, to, from, ...rest }: Move, isUndo = false) {
      if (to === from && !rest.isDeal && !isUndo) {
        return;
      }
      let rollback;
      if (isUndo) {
        if (rest.isDeal) {
          this.undo(true);
          return;
        }
        rollback = this.undo();
        const card = this.getCard(rollback?.turned);
        if (card) {
          card.turned = false;
        }
        Object.assign(
          this,
          pick(this.moves[this.moves.length - 1] || defaultMoveContext, [
            "vacancies",
            "vacancyIndex",
            "lastMoved",
          ])
        );
      } else {
        this.moves.push({ uuid, to, from, ...rest });
      }
      const index = this.getCardColumnIndex(uuid);
      if (index > -1) {
        const col = this.columns[index];
        const cardIndex = col.indexOf(uuid);
        const shouldMove = col.slice(cardIndex);
        if (
          index === 10 ||
          shouldMove.length <= this.getColumnSequenceLength(index)
        ) {
          const toMove = col.splice(cardIndex);
          if (col.length) {
            const prevCard = this.getCard(col[col.length - 1]);
            if (prevCard && !prevCard.turned) {
              prevCard.turned = true;
              this.moves[this.moves.length - 1].turned = prevCard.uuid;
            }
          }
          if (toMove.length) {
            stutter({
              action: (i) => {
                this.columns[to].push(toMove[i]);
              },
              times: toMove.length,
              interval: 42,
              callback: () => {
                if (
                  to < 10 &&
                  this.getColumnSequenceLength(to) === CARD_VALUES.length
                ) {
                  if (isUndo) {
                    this.reverseMove();
                  } else {
                    const id = this.getCard(
                      this.columns[to][
                        this.columns[to].length - CARD_VALUES.length
                      ]
                    )?.uuid!;
                    this.moveCard({
                      uuid: id,
                      from: to,
                      to: 10,
                      ...this.moveContext,
                    });
                  }
                }
              },
              callbackDelay: 333,
            });
          }
        } else {
          this.highlighted =
            col[col.length - this.getColumnSequenceLength(index)];
          this.undo();
        }
      } else {
        if (rollback) {
          this.moves.push(rollback);
        } else {
          this.undo();
        }
      }
    },
    dealMore() {
      const packed = this.cards.filter(getNotDealt).map(getUuid);
      if (packed.length) {
        stutter({
          action: (i) => {
            this.columns[i].push(packed[i]);
            const card = this.getCard(packed[i]);
            if (card) {
              Object.assign(card, { dealt: true, turned: true });
            }
          },
          times: this.activeColumns.length,
          interval: 21,
          callback: () => {
            this.moves.push({
              ...defaultMove,
              isDeal: true,
            });
          },
        });
      }
    },
    reset() {
      Object.assign(this, { ...defaultState });
    },
    start(decks?: number) {
      this.reset();
      if (decks && isFinite(decks)) {
        this.decks = decks;
      }
      Array.from({ length: this.decks }).forEach(() => {
        CARD_COLORS.forEach((color, colorIndex) => {
          CARD_VALUES.forEach((value) => {
            this.cards.push(
              new PlayingCard({
                color:
                  this.difficulty === Difficulties.EASY
                    ? CardColors.SPADES
                    : this.difficulty === Difficulties.MEDIUM
                    ? colorIndex % 2
                      ? CardColors.SPADES
                      : CardColors.HEARTS
                    : color,
                value,
              })
            );
          });
        });
      });
      this.cards = faker.helpers.shuffle(this.cards);
      stutter({
        action: (i) => {
          this.columns[i % 10].push(this.cards[i].uuid);
          this.cards[i].dealt = true;
        },
        interval: 21,
        callbackDelay: 333,
        times: 54,
        callback: () => {
          stutter({
            action: (i) => {
              const card = this.getColumnCard(i);
              if (card) {
                card.turned = true;
              }
            },
            times: this.activeColumns.length,
            interval: 21,
          });
        },
      });
    },
  },
  getters: {
    moveContext(): MoveContext {
      return pick(this, ["vacancies", "vacancyIndex", "lastMoved"]);
    },
    getCard() {
      return (id?: string) =>
        id ? this.cards.find(({ uuid }) => uuid === id) : undefined;
    },
    getCardColumnIndex() {
      return (id: string) => this.columns.findIndex((col) => col.includes(id));
    },
    getColumnCard() {
      return (index: number) => {
        const col = this.columns[index];
        const id = col[col.length - 1];
        return id ? this.getCard(id) : undefined;
      };
    },
    getColumnSequenceLength() {
      return (index: number) => {
        const column = this.columns[index];
        let output = 0;
        let card = this.getColumnCard(index);
        if (!card) {
          return output;
        } else {
          output++;
        }
        let nextCard = this.getCard(column[column.length - 2]);
        while (
          nextCard?.turned &&
          card.color === nextCard.color &&
          nextCard.value ===
            CARD_VALUES[CARD_VALUES.findIndex((val) => val === card?.value) + 1]
        ) {
          output++;
          card = nextCard;
          nextCard = this.getCard(column[column.length - 1 - output]);
        }
        return output;
      };
    },
    inSequence() {
      return (uuids: string[]) =>
        uuids
          .map(this.getCard)
          .reduce(
            (
              acc: boolean | PlayingCard | undefined,
              item: PlayingCard | undefined,
              index
            ) => {
              return index
                ? acc instanceof PlayingCard
                  ? item instanceof PlayingCard
                    ? acc.color === item.color &&
                      item.value ===
                        CARD_VALUES[
                          CARD_VALUES.findIndex((val) => val === item.value) - 1
                        ]
                    : false
                  : acc
                : item;
            },
            true
          );
    },
    sortVacancies() {
      return (vacancies: Vacancy[], c: CARD_COLOR): Vacancy[] => [
        ...vacancies
          .filter(({ color }) => color === c)
          .sort((a, b) => b.sequence - a.sequence),
        ...vacancies
          .filter(({ color }) => color !== c)
          .sort((a, b) => a.sequence - b.sequence),
      ];
    },
    vacancyMap(state) {
      return (vacancies: Vacancy[] = state.vacancies) =>
        vacancies.map((v) => v.index).sort();
    },
    deck(): PlayingCard[] {
      return this.cards.filter(getNotDealt);
    },
    activeColumns(): string[][] {
      return this.columns.filter((_, index) => index < 10);
    },
    activeHint(): Hint | undefined {
      return this.hints[this.hintIndex];
    },
  },
});
