<template>
  <div
    tabindex="0"
    class="row flex items-center gap-4 px-4 py-3.5 appearance-none"
    :class="[
      [
        hoverable
          ? 'default-focus ring-inset cursor-pointer row-hoverable'
          : 'outline-none cursor-default select-text',
      ],
      { 'opacity-50 pointer-events-none	': !subject.Evaluations.length },
    ]"
    @click="emit('click')"
    @keyup.enter="emit('click')"
  >
    <div class="min-w-0 flex-1">
      <div class="text-sm font-medium truncate">
        {{ subject.Name }}
      </div>
      <div class="mt-2.5 h-1 rounded-full overflow-hidden" :class="mark.trackClass">
        <div
          class="h-full rounded-full"
          style="transition: width 0.3s ease-in-out"
          :style="{ width: props.subject.Score + '%' }"
          :class="mark.barClass"
        />
      </div>
    </div>

    <div class="shrink-0 text-right tabular-nums leading-none">
      <span class="font-display font-semibold text-lg">
        {{ percentDecimals.before }}
      </span>
      <span class="text-xs text-plum/45 dark:text-paper/40">
        {{ percentDecimals.after && "." + percentDecimals.after }}%
      </span>
    </div>

    <span
      class="shrink-0 grid place-items-center w-9 h-9 rounded-md font-display font-bold text-base"
      :class="mark.chipClass"
    >
      {{ subject.Mark }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { getPercentDecimals, between } from "../../../utils"
import useSettingsStore from "../../../stores/settings"

const props = defineProps({
  subject: {
    type: Object,
    required: true,
  },
  hoverable: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const emit = defineEmits(["click"])

const percentDecimals = computed(() => getPercentDecimals(props.subject.Score))

const settingsStore = useSettingsStore()
const markRanges = computed(() => {
  return {
    5: {
      range: [settingsStore.ranges[3], settingsStore.ranges[4]],
      barClass: "bg-good",
      trackClass: "bg-good/15",
      chipClass: "bg-good/15 text-good-strong dark:text-good",
    },
    4: {
      range: [settingsStore.ranges[2], settingsStore.ranges[3] - 1],
      barClass: "bg-ok",
      trackClass: "bg-ok/20",
      chipClass: "bg-ok/20 text-amber-700 dark:text-ok",
    },
    3: {
      range: [settingsStore.ranges[1], settingsStore.ranges[2] - 1],
      barClass: "bg-pass",
      trackClass: "bg-pass/15",
      chipClass: "bg-pass/15 text-pass-strong dark:text-pass",
    },
    2: {
      range: [settingsStore.ranges[0], settingsStore.ranges[1] - 1],
      barClass: "bg-plum/30 dark:bg-paper/30",
      trackClass: "bg-black/10 dark:bg-white/10",
      chipClass:
        "bg-black/[0.06] dark:bg-white/[0.08] text-plum/60 dark:text-paper/60",
    },
  }
})

const mark = computed(() => {
  const roundedPercent = Math.round(props.subject.Score)
  const entry = Object.entries(markRanges.value).find(([, { range }]) =>
    between(roundedPercent, range[0], range[1])
  )
  const [name, { barClass, trackClass, chipClass }] =
    entry ?? ["5", markRanges.value[5]]
  return { name, barClass, trackClass, chipClass }
})
</script>

<style scoped>
@reference "@/assets/globals.css";

.row {
  transition: background-color 0.15s ease;
}
@media (hover: hover) {
  .row-hoverable:hover {
    @apply bg-black/[0.025] dark:bg-white/[0.03];
  }
}
</style>
