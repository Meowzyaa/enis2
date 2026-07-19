<template>
  <div
    :class="[
      { loading: active },
      [blocking ? 'loader' : 'loader-non-blocking'],
    ]"
  >
    <div class="spinner" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  blocking: {
    type: Boolean,
    default: true,
  },
})
</script>

<style>
@reference "@/assets/globals.css";

.loader-non-blocking,
.loader {
  transition: opacity 0.2s ease-in-out;
  @apply opacity-0 z-[99] items-center justify-center flex;
}
.loader-non-blocking {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  @apply absolute;
}
/* Frosted scrim over the app instead of a solid grey sheet: content stays
   visible (blurred) so loading feels lighter and keeps context. */
.loader {
  @apply fixed pointer-events-none inset-0;
  @apply bg-paper/70 dark:bg-plum-deep/60 backdrop-blur-sm;
}

.loading.loader,
.loading.loader-non-blocking {
  opacity: 1;
  pointer-events: all;
}

.loader .spinner,
.loader-non-blocking .spinner {
  height: 38px;
  width: 38px;
  border-radius: 50%;
  border: 3px solid rgba(128, 128, 128, 0.18);
  border-top-color: var(--color-coral);
  animation: loading 0.7s linear infinite;
}

@keyframes loading {
  to {
    transform: rotate(360deg);
  }
}
</style>
