<template>
  <label class="flex flex-col gap-1.5">
    <template v-if="label !== false">
      <span class="text-[13px] font-medium text-plum/70 dark:text-paper/60">
        {{ label }}
      </span>
    </template>
    <div class="relative inline-block w-full">
      <select
        v-model="model"
        class="w-full h-10 pl-3 pr-7 text-sm appearance-none rounded-lg text-left border border-black/15 dark:border-white/15 hover:border-black/25 dark:hover:border-white/25 transition-colors default-focus disabled:opacity-60 bg-paper-card dark:bg-plum-soft"
        :class="[
          { 'animate-pulse': loading },
          isDisabled ? 'cursor-default' : 'cursor-pointer',
        ]"
        :disabled="isDisabled"
      >
        <option value="none" selected disabled hidden>
          <slot name="default">Select something</slot>
        </option>
        <template v-if="loading">
          <option value="loading" selected disabled hidden>
            <slot name="loading">Loading...</slot>
          </option>
        </template>
        <template v-else>
          <option
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </template>
      </select>
      <div
        class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
        :class="{ 'opacity-30': isDisabled }"
      >
        <icon icon="ic:round-keyboard-arrow-down" class="w-4 h-4" />
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue"
import Icon from "./Icon.vue"

interface SelectOption {
  value: string | number
  label: string
}

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array as PropType<readonly SelectOption[]>,
    required: true,
  },
  label: {
    type: [Boolean, String],
    required: false,
    default: false,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(["update:modelValue"])

const isDisabled = computed(() => props.disabled || props.loading)

const model = computed({
  get: () => (props.loading ? "loading" : props.modelValue || "none"),
  set: (value) => {
    emit("update:modelValue", value)
  },
})
</script>
