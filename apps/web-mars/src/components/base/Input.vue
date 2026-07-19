<template>
  <div class="grid gap-1.5">
    <label :for="label" class="field-label">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="label"
      v-maska="typeof mask === 'string' ? mask : undefined"
      class="field"
      :class="{ 'field-invalid': !valid }"
      :value="modelValue"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
  </div>
</template>

<script setup lang="ts">
import { vMaska } from "maska/vue"

defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  mask: {
    type: [String, Boolean],
    required: false,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  valid: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const emit = defineEmits(["update:modelValue"])
</script>

<style scoped>
@reference "@/assets/globals.css";

.field-label {
  @apply text-[13px] font-medium text-plum/70 dark:text-paper/60;
}

.field {
  caret-color: var(--color-coral);
  @apply w-full h-11 px-3.5 rounded-lg text-base bg-transparent appearance-none outline-none;
  @apply border border-black/15 dark:border-white/15;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}
.field:hover {
  @apply border-black/25 dark:border-white/25;
}
.field:focus {
  @apply border-coral-strong dark:border-coral ring-2 ring-coral/25;
}
.field-invalid {
  @apply border-red-500/70;
}
.field-invalid:focus {
  @apply border-red-500 ring-red-500/20;
}

.field::-webkit-outer-spin-button,
.field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.field[type="number"] {
  -moz-appearance: textfield;
}

.field:-webkit-autofill,
.field:-webkit-autofill:hover,
.field:-webkit-autofill:focus,
.field:-webkit-autofill:active {
  box-shadow: 0 0 0px 1000px var(--autofill-background) inset;
  -webkit-box-shadow: 0 0 0px 1000px var(--autofill-background) inset;
  -webkit-text-fill-color: var(--autofill-color);
}

.field:-webkit-autofill::first-line {
  @apply !text-base tracking-tight;
}
</style>
