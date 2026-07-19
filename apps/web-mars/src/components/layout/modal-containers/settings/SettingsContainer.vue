<template>
  <div class="flex flex-col space-y-5 p-2">
    <div class="flex flex-col space-y-3">
      <span class="font-display font-bold text-lg tracking-tight">
        Settings
      </span>
      <div class="flex justify-between items-center text-sm">
        <span> Dark theme </span>
        <div>
          <Switch id="darkTheme" v-model="darkTheme" />
        </div>
      </div>
    </div>
    <div class="flex flex-col space-y-2">
      <span class="group-label">Style</span>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="t in THEMES"
          :key="t.value"
          type="button"
          class="theme-swatch"
          :class="settings.style === t.value ? 'theme-swatch--active' : ''"
          @click="settings.style = t.value"
        >
          <span class="theme-dot" :style="{ background: t.accent }" />
          <span class="flex flex-col items-start leading-tight">
            <span class="text-sm font-medium">{{ t.label }}</span>
            <span class="text-xs opacity-60">{{ t.font }}</span>
          </span>
        </button>
      </div>
    </div>
    <div class="flex flex-col space-y-2">
      <span class="group-label">Journal</span>
      <div class="flex justify-between items-center text-sm">
        <span> Hide empty </span>
        <div>
          <Switch id="hideEmpty" v-model="settings.hideEmpty" />
        </div>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span> Sort </span>
        <div>
          <Select v-model="settings.sortBy" :options="SORT_OPTIONS" />
        </div>
      </div>
    </div>
    <div class="flex flex-col space-y-2 !mb-2">
      <button
        type="button"
        class="group-label flex justify-between items-center w-full leading-9 cursor-pointer border-b border-black/10 dark:border-white/10 default-focus"
        @click="showAdvanced = !showAdvanced"
      >
        Advanced
        <icon
          :icon="
            showAdvanced
              ? 'ic:round-keyboard-arrow-up'
              : 'ic:round-keyboard-arrow-down'
          "
          class="w-4 h-4"
        />
      </button>
      <suspense v-if="showAdvanced">
        <SettingsContainerSlider />
      </suspense>
    </div>
    <div class="flex flex-col space-y-2">
      <span class="group-label">Links</span>
      <div class="flex items-center space-x-3 text-sm">
        <a class="settings-link" :href="GH_LINK" target="_blank"> repo </a>
        <a class="settings-link" :href="TG_LINK" target="_blank"> report </a>
        <a class="settings-link" :href="DA_LINK" target="_blank"> donate </a>
      </div>
    </div>
  </div>
</template>

<style>
@reference "@/assets/globals.css";

.group-label {
  @apply text-[13px] font-semibold text-plum/60 dark:text-paper/55;
}
.settings-link {
  @apply text-coral-strong dark:text-coral hover:underline;
}
.theme-swatch {
  @apply flex items-center gap-2.5 p-2 rounded-xl border border-black/10 dark:border-white/10 text-left default-focus;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.theme-swatch--active {
  @apply border-coral ring-1 ring-coral;
}
.theme-dot {
  @apply w-6 h-6 rounded-full shrink-0 shadow-inner;
}
</style>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue"
import { storeToRefs } from "pinia"
import { DA_LINK, GH_LINK, TG_LINK } from "../../../../config"
import useSettingsStore from "../../../../stores/settings"
import Icon from "../../../base/Icon.vue"
import Switch from "../../../base/Switch.vue"
import Select from "../../../base/Select.vue"

const SettingsContainerSlider = defineAsyncComponent(() =>
  import("./SettingsContainerSlider.vue")
)

const THEMES = [
  { value: "forest", label: "Forest", font: "Geist", accent: "#f86f5e" },
  { value: "grape", label: "Grape", font: "Space Grotesk", accent: "#e0529c" },
  { value: "sand", label: "Sand", font: "Fraunces", accent: "#d2693f" },
  { value: "ocean", label: "Ocean", font: "Sora", accent: "#2bb6c4" },
]

const SORT_OPTIONS = [
  {
    value: "score",
    label: "By percent",
  },
  {
    value: "name",
    label: "Alphabetically",
  },
]

const settingsStore = useSettingsStore()

const showAdvanced = ref(false)

const { settings, darkTheme } = storeToRefs(settingsStore)
</script>
