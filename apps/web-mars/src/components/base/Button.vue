<template>
  <component
    :is="tag"
    :type="type"
    :disabled="isDisabled"
    :href="href || null"
    :role="tag === 'a' ? 'link' : 'button'"
    :target="target"
    :rel="rel"
    :class="[
      [icon ? 'base-button-icon' : 'base-button-default'],
      [color && `base-button-${color}`],
      [
        isDisabled
          ? `cursor-default`
          : `base-button-${color}--hover cursor-pointer`,
      ],
      { 'base-button-rounded': rounded },
      { 'base-button-round': round },
      { 'base-button-disabled': disabled },
      { 'base-button-fullwidth': wFull },
    ]"
    class="base-button default-focus"
    v-bind="$attrs"
    @click.stop="emit('click', $event)"
  >
    <Icon v-if="loading" class="animate-spin h-5 w-5" icon="gg:spinner" />
    <template v-else>
      <slot />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "./Icon.vue"

const props = defineProps({
  color: {
    type: String,
    required: false,
    default: "standard",
    validator(value: string) {
      return ["standard", "primary", "negative"].includes(value)
    },
  },
  type: {
    type: String,
    required: false,
    default: "button",
  },
  tag: {
    type: String,
    required: false,
    default: "button",
    validator(value: string) {
      return ["button", "a"].includes(value)
    },
  },
  href: {
    type: String,
    required: false,
    default: "",
  },
  target: {
    type: String,
    required: false,
    default: "_blank",
  },
  rel: {
    type: String,
    required: false,
    default: "noopener",
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  wFull: {
    type: Boolean,
    required: false,
    default: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  rounded: {
    type: Boolean,
    required: false,
    default: false,
  },
  round: {
    type: Boolean,
    required: false,
    default: false,
  },
  icon: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(["click"])

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<style scoped>
@reference "@/assets/globals.css";

.base-button {
  @apply flex appearance-none items-center justify-center text-center select-none text-sm font-semibold visited:text-current;
  transition:
    transform 160ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 200ms ease,
    color 200ms ease,
    filter 200ms ease;
}
/* Physical press feedback on every pressable element. */
.base-button:not(.base-button-disabled):active {
  transform: scale(0.97);
}
.base-button-icon {
  @apply h-9 w-9 rounded-full;
}
.base-button-default {
  @apply h-11 px-5;
}
.base-button-disabled {
  @apply opacity-20;
}
.base-button-fullwidth {
  @apply w-full;
}
.base-button-rounded {
  @apply rounded-lg;
}
.base-button-round {
  @apply rounded-full;
}
/* Ghost neutral: matches the header icon-button treatment in AppShell. */
.base-button-standard {
  @apply text-plum/60 dark:text-paper/60 bg-transparent;
}
.base-button-standard--hover {
  @apply hover:bg-black/5 dark:hover:bg-white/10 hover:text-plum dark:hover:text-paper;
}
/* Primary action: solid accent with ink text (readable on every preset). */
.base-button-primary {
  @apply bg-coral text-plum-deep;
}
.base-button-primary--hover {
  @apply hover:brightness-105 active:brightness-95;
}
/* Destructive: tinted, not shouting. */
.base-button-negative {
  @apply text-red-600 dark:text-red-400 bg-red-500/10;
}
.base-button-negative--hover {
  @apply hover:bg-red-500/20;
}
</style>
