import { CARD_COLOR, CARD_VALUE } from "./index";
import { v4 } from "uuid";

interface IPlayingCard {
  value: CARD_VALUE;
  color: CARD_COLOR;
}

export class PlayingCard implements IPlayingCard {
  value!: CARD_VALUE;
  color!: CARD_COLOR;
  dealt = false;
  uuid!: string;
  turned = false;

  constructor(data: IPlayingCard | PlayingCard) {
    if (data instanceof PlayingCard) return data;
    Object.assign(this, data);
    if (!this.uuid) this.uuid = v4();
  }
}
