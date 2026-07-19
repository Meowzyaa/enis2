<template>
  <div class="flex items-center justify-between text-sm !mb-9">
    <span>Grading scale</span>
    <span
      @click="resetRanges"
      class="text-coral-strong dark:text-coral hover:underline cursor-pointer"
    >
      Reset
    </span>
  </div>
  <vue-slider
    class="!-px-2"
    v-model="ranges"
    :process="process"
    :min-range="15"
    :interval="1"
  >
    <template #dot="{ focus }">
      <div :class="['custom-dot', { focus }]"></div>
    </template>
    <template #process="{ style, index }">
      <div class="absolute" :style="[style]" :class="COLORS[index]">
        <div
          :class="[
            'merge-tooltip',
            'vue-custom-slider-dot-tooltip-inner',
            'vue-custom-slider-dot-tooltip-inner-top',
          ]"
        >
          {{ ranges[index] }} - {{ ranges[index + 1] }}
        </div>
      </div>
    </template>
  </vue-slider>
</template>

<style>
@reference "@/assets/globals.css";

.merge-tooltip {
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translate(-50%, -11px);
}
.custom-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  @apply bg-plum dark:bg-paper;
}
.vue-custom-slider-dot-tooltip-inner {
  font-size: 14px;
  white-space: nowrap;
  padding: 2px 5px;
  min-width: 20px;
  text-align: center;
  border-radius: 5px;
  box-sizing: content-box;
  @apply bg-black/10 text-plum border-black/10 dark:bg-plum-soft dark:text-white/90 dark:border-plum-soft;
}
.vue-custom-slider-dot-tooltip-inner::after {
  content: "";
  position: absolute;
}
.vue-custom-slider-dot-tooltip-inner-top::after {
  top: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-top-color: inherit;
}
</style>

<style>
@import "vue-slider-component/theme/default.css";
</style>

<script setup lang="ts">
import { ref } from "vue"
import { storeToRefs } from "pinia"
import VueSlider from "vue-slider-component"
import { DEFAULT_RANGES } from "../../../../config"
import useSettingsStore from "../../../../stores/settings"

const process = (val: number[]) =>
  ref([
    [val[0], val[1]],
    [val[1], val[2]],
    [val[2], val[3]],
    [val[3], val[4]],
  ])

const COLORS = [
  "dark:bg-black/80 bg-black/30",
  "bg-pass",
  "bg-ok",
  "bg-good",
]

const settingsStore = useSettingsStore()
const { ranges } = storeToRefs(settingsStore)

const resetRanges = () => {
  ranges.value = [...DEFAULT_RANGES]
}
</script>
