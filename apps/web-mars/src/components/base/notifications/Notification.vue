<template>
  <div class="notify select-none" :class="notifyClass">
    <div
      v-if="notification.progress && notification.delay"
      :style="progressStyle"
      class="notify-progress"
    />
    <div class="notify-box">
      <span class="notify-message">{{ notification.message }}</span>
      <div v-if="notification.actions">
        <button
          v-for="(action, index) in notification.actions"
          :key="`${action}-${index}`"
          type="button"
          class="notify-action-btn"
          @click="handleAction(action.handler)"
        >
          {{ action.title }}
        </button>
      </div>
      <button
        v-if="notification.closable"
        type="button"
        class="notify-close default-focus"
        aria-label="Dismiss notification"
        @click="closeNotification(notification)"
      >
        <icon icon="eva:close-fill" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import Icon from "../Icon.vue"

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["close-notification"])

const interval = ref<ReturnType<typeof setInterval> | null>(null)
const timeLeft = ref(0)
const speed = ref(100)

const notifyClass = computed(() => {
  const type = props.notification.type
  return {
    "notify-success": type === "success",
    "notify-warning": type === "warning",
    "notify-danger": type === "danger",
    "notify-info": type === "info",
  }
})

const timeLeftPercent = computed(() => {
  return Math.round(
    (((timeLeft.value * 100) / props.notification.delay) * 100) / 100
  )
})

const progressStyle = computed(() => {
  return {
    width: timeLeftPercent.value + "%",
    transition: "width 0.1s linear",
  }
})

onMounted(() => {
  const { delay, progress } = props.notification
  if (delay && progress) {
    timeLeft.value = delay - 100
    interval.value = setInterval(() => updateTime(), speed.value)
  }
})

const closeNotification = (notification?: any) => {
  emit("close-notification", notification)
  destroy()
}

const updateTime = () => {
  timeLeft.value -= speed.value
  // `<= 0`: a delay that isn't a multiple of the tick would skip past zero
  // and leave the interval running forever.
  if (timeLeft.value <= 0) {
    destroy()
  }
}

const handleAction = (action: () => void) => {
  action()
  closeNotification()
}

const destroy = () => {
  if (interval.value !== null) clearInterval(interval.value)
}

// The parent removes toasts via its own timeout; without this, every toast
// unmounted mid-countdown leaks its interval.
onUnmounted(destroy)
</script>

<style scoped>
@reference "@/assets/globals.css";

/* Flat toast: neutral surface, the type speaks through the left edge. */
.notify {
  --n-color: var(--color-coral);
  @apply surface relative mt-4 p-2 pl-3 table rounded-lg text-sm shadow-lg overflow-hidden;
}
.notify::before {
  content: "";
  @apply absolute left-0 top-0 bottom-0 w-[3px];
  background: var(--n-color);
}
.notify-progress {
  @apply absolute bottom-0 left-0 h-0.5 z-50 opacity-60;
  background: var(--n-color);
}
.notify-info {
  --n-color: var(--color-coral);
}
.notify-success {
  --n-color: var(--color-good);
}
.notify-warning {
  --n-color: var(--color-ok);
}
.notify-danger {
  --n-color: var(--color-red-500);
}
.notify-box {
  @apply flex flex-row items-center justify-between;
}
.notify-message {
  @apply pl-2 pr-3;
}
.notify-close {
  @apply rounded-full text-plum/50 dark:text-paper/50 justify-center inline-flex duration-150 cursor-pointer p-1 hover:bg-black/5 dark:hover:bg-white/10;
}
.notify-action-btn {
  @apply p-2 rounded-lg font-semibold duration-100 text-coral-strong dark:text-coral hover:bg-black/5 dark:hover:bg-white/10 default-focus;
}
</style>
