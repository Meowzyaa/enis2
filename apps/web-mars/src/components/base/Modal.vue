<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-200 transform"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-100 transform"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="show"
        tabindex="-1"
        class="fixed inset-0 bg-plum-deep/50 backdrop-blur-[2px] z-40"
      >
        <div
          class="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
          @click="close"
        >
          <button
            type="button"
            class="close-icon default-focus"
            aria-label="Close dialog"
            @click="close"
          >
            <Icon icon="eva:close-fill" class="w-7 h-7" />
          </button>
          <transition
            enter-active-class="transition ease-out duration-200 transform"
            enter-from-class="opacity-0 translate-y-4 scale-[0.97]"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-100 transform"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-4 scale-[0.97]"
          >
            <div
              v-if="show"
              ref="windowRef"
              class="modal-window"
              role="dialog"
              aria-modal="true"
              tabindex="-1"
              @click.stop
            >
              <div class="p-4 max-h-[85svh] overflow-y-auto">
                <slot />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from "vue"
import { useScrollLock } from "@vueuse/core"
import Icon from "./Icon.vue"

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(["close"])

const isLocked = useScrollLock(document.body)
const windowRef = ref<HTMLElement | null>(null)

// Move keyboard focus into the dialog on open and back to the trigger on
// close, so keyboard/AT users aren't left focused behind the overlay.
let opener: HTMLElement | null = null

watch(
  () => props.show,
  (value) => {
    isLocked.value = value
    if (value) {
      opener = document.activeElement as HTMLElement | null
      nextTick(() => windowRef.value?.focus())
    } else {
      opener?.focus()
      opener = null
    }
  }
)

const handleKeydown = (e: KeyboardEvent) => {
  if (props.show && e.key === "Escape") {
    close()
  }
}

const close = () => {
  emit("close")
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown)
})
</script>

<style scoped>
@reference "@/assets/globals.css";

.close-icon {
  @apply grid place-items-center w-10 h-10 text-white/60 hover:text-white rounded-full duration-100 cursor-pointer absolute right-2 top-2;
}
.modal-window {
  @apply surface rounded-xl text-left outline-none;
  @apply relative shadow-xl align-middle;
  @apply sm:max-w-lg w-full overflow-hidden;
}
</style>
