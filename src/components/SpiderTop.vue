<template>
  <div class="top">
    <div class="remaining-cards" @click="dealMore">
      <PlayingCard
        v-for="{ uuid } in deck.reverse()"
        :key="uuid"
        :uuid="uuid"
      />
    </div>
    <div class="taken-out">
      <PlayingCard v-for="uuid in columns[10]" :key="uuid" :uuid="uuid" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import PlayingCard from "./PlayingCard.vue";
import { storeToRefs } from "pinia";
import { useSpider } from "../store";
const { dealMore } = useSpider();
const { columns, deck } = storeToRefs(useSpider());
</script>
<style scoped lang="scss">
.top {
  @apply flex justify-between min-h-[15vw] sm:min-h-[105px] md:min-h-[125px] lg:min-h-[160px] xl:min-h-[200px];
}

.remaining-cards {
  @apply flex;
}
</style>
