<template>
  <div
    class="playing-card"
    :class="{
      turned: card.turned,
      inSequence,
      isAnimated,
      'opacity-0': !isVisible,
      isBlocking,
      isHintTarget,
      isHint,
    }"
    @click="onCardClick"
  >
    <div ref="cardEl" class="inner" :style="style">
      <template v-if="card.turned">
        <div :class="['card-face', card.color]">
          <span v-html="cardUnicode(card)" />
        </div>
      </template>
      <div v-else class="card-back"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayingCard } from "../types";
import { useSpider } from "../store";
import { cardUnicode } from "../helpers";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  toRefs,
} from "vue";

const game = useSpider();
const props = defineProps({
  inSequence: {
    type: Boolean,
    default: false,
  },
  uuid: {
    type: String,
    required: true,
  },
  isHintTarget: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["on-card-click"]);
const onCardClick = () => emit("on-card-click", state.card?.uuid);

interface State {
  cardEl: HTMLDivElement | null;
  rect?: DOMRect;
  style: Record<string, string>;
  isVisible: boolean;
  isAnimated: boolean;
  card?: PlayingCard;
  isHint: boolean;
  isBlocking: boolean;
}
const state: State = reactive({
  cardEl: null,
  rect: computed(() => game.rects[props.uuid]),
  style: {},
  isVisible: false,
  isAnimated: false,
  card: computed(() => game.getCard(props.uuid)),
  isHint: computed(() => game.activeHint?.uuid === props.uuid),
  isBlocking: computed(() => game.highlighted === props.uuid),
});
const { style, isVisible, isAnimated, card, isBlocking, isHint, cardEl } =
  toRefs(state);

onMounted(() => {
  setTimeout(() => {
    requestAnimationFrame(() => {
      if (state.rect) {
        const actual = state.cardEl?.getBoundingClientRect();
        if (actual) {
          state.style = {
            transform: `translate(${state.rect.x - actual.x}px, ${
              state.rect.y - actual.y
            }px)`,
          };
          requestAnimationFrame(() => {
            state.isVisible = true;
            state.isAnimated = true;
            nextTick(() => {
              state.style = {};
              setTimeout(() => {
                state.isAnimated = false;
              }, 333);
            });
          });
        } else {
          state.isVisible = true;
        }
      } else {
        state.isVisible = true;
      }
    });
  });
});
onBeforeUnmount(() => {
  if (state.card?.turned || !game.rects[props.uuid]) {
    game.updateRect({ [props.uuid]: state.cardEl?.getBoundingClientRect() });
  }
});
</script>

<style scoped lang="scss">
.playing-card {
  @apply max-h-1.5 cursor-pointer overflow-visible relative transition-[max-height];
  box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%),
    0 3px 1px -2px rgb(0 0 0 / 12%);
  .inner {
    @apply transform-none bg-gray-50 rounded border border-gray-400 aspect-[var(--card-ratio)]
    p-[2px] sm:p-1 xl:p-[.35rem];
  }
  &.turned {
    @apply max-h-8;
    &:hover {
      @apply max-h-12;
    }
    .inner {
      @apply bg-white;
    }
  }
  &.inSequence {
    @apply max-h-3.5;
  }
  &.isHint {
    @apply max-h-12;
    .inner {
      @apply bg-teal-100 z-10 relative;
    }
  }
  &.isBlocking .inner {
    @apply z-10 relative outline outline-8 outline-orange-500/70 outline-dashed outline-offset-8;
  }
  &.isHintTarget .inner {
    @apply outline outline-8 outline-dashed outline-teal-500/70 outline-offset-8 z-10 relative;
  }
  &.isAnimated {
    @apply z-10 shadow-none pointer-events-none;
    .inner {
      @apply transition-transform;
    }
  }
  .card-face {
    @apply overflow-hidden text-black h-full;
    > * {
      @apply leading-none block
      text-[length:var(--card-font)]
      mt-[var(--card-top)]
      mx-[var(--card-x)];
    }
    &.B,
    &.C {
      @apply text-red-700;
    }
  }
  .card-back {
    @apply bg-teal-700 h-full;
  }
}
</style>
