<template>
  <div
    class="rounded-lg p-3 border border-black/[0.07] dark:border-white/[0.08] bg-paper dark:bg-plum-soft/40 flex flex-col space-y-2"
  >
    <div class="flex space-x-1 items-baseline justify-between">
      <span class="font-display font-semibold text-sm">
        {{ LABEL_TYPES[type] }}
      </span>
      <span
        class="font-normal text-xs text-plum/50 dark:text-paper/45 tabular-nums"
      >
        {{ sectionsScore }}/{{ sectionsMaxScore }} - {{ sectionsPercent }}%
      </span>
    </div>
    <div
      v-for="(section, idx) in data"
      :key="section.Name"
      class="flex flex-row justify-between items-start space-x-2 text-sm"
    >
      <span class="w-4/5 justify-start">{{ section.Name }}</span>
      <div class="w-auto justify-end">
        <div class="w-full flex items-start justify-evenly text-center">
          <div class="w-4.7">
            <template v-if="subjectStore.GM">
              <ScrollPicker
                v-model="section.Score"
                :options="createArray({ length: section.MaxScore + 1 })"
              />
            </template>
            <template v-else>
              {{ section.Score === -1 ? "-" : section.Score }}
            </template>
          </div>
          <div class="w-2">/</div>
          <div class="w-4.7">
            <template
              v-if="
                subjectStore.GM &&
                subjectStore.subject.originalSections[type][idx].MaxScore === 0
              "
            >
              <scroll-picker
                v-model="section.MaxScore"
                :options="createArray({ length: 70 })"
              />
            </template>
            <template v-else>
              {{ section.MaxScore === 0 ? "-" : section.MaxScore }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue"
import { getSectionsScores, formatPercent } from "../../../utils"
import ScrollPicker from "../ScrollPicker.vue"
import useSubjectStore from "../../../stores/subject"

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    required: true,
  },
  type: {
    type: String as PropType<"SAU" | "SAT">,
    required: true,
  },
})

const LABEL_TYPES = {
  SAU: "SAU",
  SAT: "SAT",
}

const subjectStore = useSubjectStore()

const createArray = ({ length }: { length: number }) =>
  Array.from({ length }, (_, i) => i)

const sectionsScore = computed(() => {
  const { score } = getSectionsScores(props.data)
  return score
})
const sectionsMaxScore = computed(() => {
  const { max } = getSectionsScores(props.data)
  return max
})
const sectionsPercent = computed(() => {
  return formatPercent((sectionsScore.value / sectionsMaxScore.value) * 100)
})
</script>
