<template>
  <SpiderTop />
  <div class="layout">
    <div v-for="(column, index) in activeColumns" :key="index">
      <PlayingCard
        v-for="(uuid, pos) in column"
        :key="uuid"
        :is-hint-target="isHintTarget({ column, index, pos })"
        :uuid="uuid"
        :in-sequence="inSequence(column, pos)"
        @on-card-click="onCardPressed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpider } from "../store";
import { storeToRefs } from "pinia";
import PlayingCard from "./PlayingCard.vue";
import { onMounted, watch } from "vue";
import SpiderTop from "./SpiderTop.vue";
import { getValueIndex } from "../helpers";

const game = useSpider();
const { onCardPressed, start } = game;
const { activeColumns, getCard, highlighted, activeHint } = storeToRefs(game);
const isHintTarget = ({
  column,
  index,
  pos,
}: {
  column: string[];
  index: number;
  pos: number;
}) => column.length - 1 === pos && activeHint.value?.to === index;
const inSequence = (column: string[], index: number) => {
  if (!index) {
    return false;
  }
  const [prev, curr, next] = Array.from({ length: 3 }).map((_, i) =>
    getCard.value(column[index - 1 + i])
  );
  return (
    prev?.turned &&
    next &&
    prev.color === curr?.color &&
    next.color === curr.color &&
    getValueIndex(prev.value) === getValueIndex(curr.value) + 1 &&
    getValueIndex(curr.value) === getValueIndex(next.value) + 1
  );
};
watch(highlighted, (val) => {
  setTimeout(() => {
    if (highlighted.value === val) {
      highlighted.value = "";
    }
  }, 2000);
});
onMounted(start);
</script>

<style scoped lang="scss">
.layout {
  @apply grid grid-cols-10 sm:gap-1 gap-[1px] pb-96;
  > * {
    @apply relative;
    &:before {
      @apply absolute w-full aspect-[.667] bg-white/5 rounded-sm outline-2 outline-white/5 outline -outline-offset-2 pointer-events-none;
      content: "";
    }
    @apply flex flex-col;
    :deep(.playing-card) {
      &.isHint {
        background-color: #ccc;
        @apply relative z-10;
      }
      &.isHint,
      &.isBlocking {
        + * {
          @apply relative z-10;
        }
      }
    }
  }
}
</style>
