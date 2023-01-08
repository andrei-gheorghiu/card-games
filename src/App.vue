<script setup lang="ts">
import SpiderSolitaire from "./components/SpiderSolitaire.vue";
import { useSpider } from "./store";
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, reactive } from "vue";
import { getCardFontSize, getCardTopMargin, getCardXMargins } from "./helpers";
const { reverseMove, getHints } = useSpider();
const { moves } = storeToRefs(useSpider());
const cardSizes = reactive({
  "--card-font": "0",
  "--card-top": "0",
  "--card-x": "0",
  "--card-ratio": "0",
});
const updateFontSize = () => {
  const width = document.documentElement.clientWidth;
  Object.assign(cardSizes, {
    "--card-font": getCardFontSize(width),
    "--card-top": getCardTopMargin(width),
    "--card-x": getCardXMargins(width),
    "--card-ratio": ".667",
  });
};
onMounted(() => {
  updateFontSize();
  window.addEventListener("resize", updateFontSize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateFontSize);
});
</script>

<template>
  <div :style="cardSizes">
    <button :disabled="!moves.length" class="btn" @click="reverseMove">
      Undo
    </button>
    <button class="btn" @click="getHints">Hint</button>
    <SpiderSolitaire />
  </div>
</template>
<style lang="scss">
.btn {
  @apply border border-white bg-white/10 text-white text-sm px-4 pt-1 h-10 hover:bg-white/20 cursor-pointer uppercase rounded inline-flex items-center my-4;
  &:disabled {
    @apply opacity-[50%] cursor-auto;
  }
}
</style>
