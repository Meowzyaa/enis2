<template>
  <label class="inline-flex items-center text-sm cursor-pointer select-none">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="appearance-none absolute h-5 w-5 rounded-md default-focus"
    />
    <div
      class="checkbox-box border-black/20 dark:border-white/20 border-2 rounded-md w-5 h-5 flex shrink-0 justify-center items-center mr-2.5"
    >
      <Icon
        icon="bi:check"
        class="w-3 h-3 text-plum-deep pointer-events-none fill-current"
      />
    </div>
    {{ label }}
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "./Icon.vue"

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["update:modelValue"])

const model = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value)
  },
})
</script>

<style scoped>
@reference "@/assets/globals.css";

.checkbox-box {
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 150ms cubic-bezier(0.23, 1, 0.32, 1);
}
/* Box squishes under the press, check pops in on release. */
label:active .checkbox-box {
  transform: scale(0.9);
}
.checkbox-box svg {
  opacity: 0;
  transform: scale(0.4);
  transition:
    opacity 120ms ease,
    transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
input:checked + .checkbox-box {
  @apply !border-coral bg-coral;
}
input:checked + .checkbox-box svg {
  opacity: 1;
  transform: scale(1);
}
</style>
