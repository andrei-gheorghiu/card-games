import { CARD_VALUE, CARD_VALUES, PlayingCard } from "./types";

export const cardUnicode = (card: PlayingCard) =>
  `&#${parseInt(`1F0${card.color}${card.value}`, 16)};`;

export const getValueIndex = (value?: CARD_VALUE) =>
  value ? CARD_VALUES.indexOf(value) : -1;

export const stutter = ({
  action = (i: number) => console.log(i),
  interval = 0,
  callback = () => {},
  times = 1,
  callbackDelay = 0,
}) => {
  for (let i = 0; i < times; i++) {
    setTimeout(() => {
      action(i);
    }, interval * i);
  }
  setTimeout(() => {
    callback();
  }, times * interval + callbackDelay);
};
export const getUuid = ({ uuid }: { uuid: string }) => uuid;
export const getNotDealt = ({ dealt }: { dealt: boolean }) => !dealt;
export const getCardFontSize = (w: number) => {
  switch (true) {
    case w < 640:
      return `${0.00430108 * w + 13.2516}vw`;
    case w < 768:
      return `${25.8386 - 0.0177165 * w}vw`;
    case w < 1024:
      return "115px";
    case w < 1280:
      return "158px";
    default:
      return "199px";
  }
};
export const getCardTopMargin = (w: number) => {
  switch (true) {
    case w < 640:
      return `${0.870968 - 0.0107527 * w}px`;
    case w < 768:
      return "-6px";
    case w < 1024:
      return "-7px";
    case w < 1280:
      return "-9px";
    default:
      return "-12px";
  }
};
export const getCardXMargins = (w: number) => {
  switch (true) {
    case w < 640:
      return `-${0.00716846 * w + 0.419355}px`;
    case w < 1024:
      return "-6px";
    case w < 1280:
      return "-7px";
    default:
      return "-10px";
  }
};
