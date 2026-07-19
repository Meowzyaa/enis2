<template>
  <LoadingOverlay
    :active="loaderStore.overlay.active"
    :blocking="loaderStore.overlay.blocking"
  />
  <Modal :show="showAvailabilityModal" @close="showAvailabilityModal = false">
    <AvailabilityContainer />
  </Modal>
  <RouterView />
  <Notifications />
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import { storeToRefs } from "pinia"
import useLoaderStore from "./stores/loader"
import useSettingsStore from "./stores/settings"
import useHealthStore from "./stores/health"
import LoadingOverlay from "./components/base/loaders/LoadingOverlay.vue"
import Modal from "./components/base/Modal.vue"
import AvailabilityContainer from "./components/layout/modal-containers/AvailabilityContainer.vue"
import Notifications from "./components/base/notifications/Notifications.vue"

const loaderStore = useLoaderStore()
const settingsStore = useSettingsStore()
const healthStore = useHealthStore()

const { showAvailabilityModal } = storeToRefs(healthStore)

const isDarkTheme = computed(() => settingsStore.settings.theme === "dark")

watch(
  isDarkTheme,
  (theme) => {
    const root = document.documentElement.classList

    const toggleClass = (value: boolean, className: string) =>
      value ? root.add(className) : root.remove(className)

    toggleClass(theme, "dark")
  },
  { immediate: true }
)

// Style presets (color palette + font) applied via `theme-<name>` on <html>.
// "forest" is the baseline defined in globals.css, so it carries no class.
const style = computed(() => settingsStore.settings.style)

watch(
  style,
  (next, prev) => {
    const root = document.documentElement.classList
    if (prev) root.remove(`theme-${prev}`)
    if (next && next !== "forest") root.add(`theme-${next}`)
  },
  { immediate: true }
)
</script>
