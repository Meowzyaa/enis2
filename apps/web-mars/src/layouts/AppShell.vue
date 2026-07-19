<template>
  <div class="min-h-[100svh] flex flex-col">
    <header
      class="sticky top-0 z-20 bg-paper/90 dark:bg-plum-deep/90 backdrop-blur border-b border-black/[0.07] dark:border-white/[0.08]"
    >
      <div
        class="mx-auto w-full max-w-[1080px] px-4 lg:px-6 h-14 flex items-center gap-2"
      >
        <div class="flex items-center gap-2.5 mr-2">
          <span
            class="grid place-items-center w-8 h-8 rounded-lg bg-coral text-plum-deep"
          >
            <Logo class="w-[18px] h-[18px]" />
          </span>
          <span
            class="font-display font-bold text-[15px] tracking-tight hidden sm:block"
          >
            NovaNIS
          </span>
        </div>

        <nav class="hidden sm:flex items-stretch self-stretch">
          <RouterLink
            v-for="link in links"
            :key="link.name"
            :to="{ name: link.name }"
            class="nav-link"
            :class="{ 'nav-link--active': route.name === link.name }"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="flex-1" />

        <div class="w-30 sm:w-36">
          <Select
            v-if="yearOptions.length"
            v-model="settings.year"
            :options="yearOptions"
          >
            <template #default>Year</template>
          </Select>
        </div>

        <ThemeToggler />

        <button
          class="grid place-items-center w-9 h-9 rounded-full text-plum/60 dark:text-paper/60 hover:bg-black/5 dark:hover:bg-white/10 default-focus"
          aria-label="Settings"
          @click="showSettings = true"
        >
          <Icon icon="clarity:settings-solid" class="text-xl" />
        </button>
      </div>
    </header>

    <main
      class="flex-1 w-full mx-auto max-w-[1080px] px-4 lg:px-6 py-6 pb-28 sm:pb-10"
    >
      <RouterView v-slot="{ Component }">
        <Transition name="view" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <nav
      class="sm:hidden fixed bottom-0 inset-x-0 z-30 flex bg-paper-card dark:bg-plum-card border-t border-black/[0.07] dark:border-white/[0.08] pb-[env(safe-area-inset-bottom)]"
    >
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="{ name: link.name }"
        class="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] default-focus"
        :class="
          route.name === link.name
            ? 'text-coral-strong dark:text-coral font-medium'
            : 'text-plum/50 dark:text-paper/40'
        "
      >
        <Icon :icon="link.icon" class="text-2xl" />
        {{ link.label }}
      </RouterLink>
      <button
        class="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-plum/50 dark:text-paper/40 default-focus"
        @click="showSettings = true"
      >
        <Icon icon="clarity:settings-solid" class="text-2xl" />
        More
      </button>
    </nav>

    <Modal :show="showSettings" @close="showSettings = false">
      <SettingsContainer />
      <div class="mt-4">
        <Button rounded w-full color="negative" @click="logout()">
          Log out
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import useSettingsStore from "../stores/settings"
import useYearsStore from "../stores/years"
import useAuthStore from "../stores/auth"
import Icon from "../components/base/Icon.vue"
import Logo from "../components/base/app/Logo.vue"
import Select from "../components/base/Select.vue"
import Modal from "../components/base/Modal.vue"
import Button from "../components/base/Button.vue"
import ThemeToggler from "../components/layout/ThemeToggler.vue"
import SettingsContainer from "../components/layout/modal-containers/settings/SettingsContainer.vue"

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const yearsStore = useYearsStore()
const authStore = useAuthStore()
const { settings } = storeToRefs(settingsStore)

const showSettings = ref(false)

const logout = () => {
  authStore.logout()
  showSettings.value = false
  router.push({ name: "login" })
}

const links = [
  { name: "diary", label: "Diary", icon: "mdi:notebook-outline" },
  { name: "tabel", label: "Report card", icon: "mdi:clipboard-text-outline" },
]

const yearOptions = computed(() =>
  yearsStore.years.map((y) => ({ value: y.label, label: y.label }))
)
</script>

<style scoped>
@reference "@/assets/globals.css";

/* Header nav: quiet text links, the active one carries an accent baseline. */
.nav-link {
  @apply relative flex items-center px-3 text-sm font-medium text-plum/50 dark:text-paper/45 default-focus;
  transition: color 0.18s ease;
}
.nav-link:hover {
  @apply text-plum dark:text-paper;
}
.nav-link--active {
  @apply text-plum dark:text-paper;
}
.nav-link--active::after {
  content: "";
  @apply absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-coral-strong dark:bg-coral;
}
</style>
