<template>
  <div class="min-h-[100svh] grid place-items-center sm:p-6">
    <main
      class="surface w-full sm:max-w-[440px] lg:max-w-[880px] grid lg:grid-cols-[1.08fr_1fr] overflow-hidden min-h-[100svh] sm:min-h-0 rounded-none sm:rounded-xl"
    >
      <!-- Brand panel (desktop only) -->
      <section
        class="brand relative hidden lg:flex flex-col justify-between p-9 bg-plum-deep text-paper"
      >
        <Logo
          class="watermark absolute -right-14 -bottom-16 w-72 h-72 text-paper"
          aria-hidden="true"
        />
        <div class="flex items-center gap-3">
          <span
            class="grid place-items-center w-10 h-10 rounded-lg bg-coral text-plum-deep"
          >
            <Logo class="w-5 h-5" />
          </span>
          <div class="leading-none">
            <div class="font-display font-extrabold text-xl tracking-tight">
              NovaNIS
            </div>
            <div class="text-xs text-paper/40 mt-1">Electronic diary</div>
          </div>
        </div>

        <div>
          <h2
            class="font-display font-extrabold text-3xl leading-tight max-w-[16ch]"
          >
            Your grades, without the clutter.
          </h2>
          <p class="mt-3 text-sm text-paper/50 max-w-[36ch]">
            Diary, report card and terms from NIS in one fast, clean app.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            :href="TG_LINK"
            target="_blank"
            rel="noopener"
            aria-label="Telegram"
            class="brand-link default-focus"
          >
            <Icon icon="akar-icons:telegram-fill" />
          </a>
          <a
            :href="GH_LINK"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            class="brand-link default-focus"
          >
            <Icon icon="akar-icons:github-fill" />
          </a>
        </div>
      </section>

      <!-- Form panel -->
      <section class="flex flex-col justify-center gap-8 p-6 py-10 sm:p-10">
        <header class="lg:hidden flex items-center gap-3">
          <span
            class="grid place-items-center w-10 h-10 rounded-lg bg-coral text-plum-deep"
          >
            <Logo class="w-5 h-5" />
          </span>
          <div class="leading-none">
            <div class="font-display font-extrabold text-xl tracking-tight">
              NovaNIS
            </div>
            <div class="text-xs text-plum/40 dark:text-paper/40 mt-1">
              Electronic diary
            </div>
          </div>
        </header>

        <div class="hidden lg:block">
          <h1 class="font-display font-bold text-2xl">Welcome back</h1>
          <p class="text-sm text-plum/50 dark:text-paper/40 mt-1">
            Log in with your NIS account
          </p>
        </div>

        <form class="grid gap-5 grid-cols-1" @submit.prevent="onSubmit(submit)">
          <!-- text + numeric keypad, not type="number": IINs can start with 0
               (2000s birth years), and number inputs mangle leading zeros,
               accept e/+/-, and change value on scroll. The mask already
               restricts input to digits. -->
          <Input
            v-model="form.login"
            type="text"
            inputmode="numeric"
            autocomplete="username"
            autofocus
            label="Your IIN"
            mask="############"
            :valid="!status.login.isError"
          />
          <Input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            label="Your password"
            :valid="!status.password.isError"
          />
          <transition name="fade">
            <div
              v-if="captcha"
              class="flex flex-col sm:flex-row justify-between gap-2"
            >
              <Image
                class="object-contain w-44 h-12 cursor-pointer select-none duration-150 hover:opacity-50"
                alt="captcha"
                :src="`data:image/png;base64,${captcha}`"
                @click="authStore.updateCaptcha"
              />
              <div>
                <Input
                  v-model="form.captchaInput"
                  type="text"
                  label="Captcha"
                />
              </div>
            </div>
          </transition>
          <Select
            v-model="settings.school"
            :loading="loaderStore.loadingKey === 'CITY'"
            :options="SCHOOLS"
            label="School"
            required
          >
            <template #default>Select school</template>
            <template #loading>Searching schools...</template>
          </Select>
          <Checkbox
            label="Remember me"
            id="rememberMe"
            v-model="settings.rememberMe"
          />
          <Button
            type="submit"
            rounded
            w-full
            color="primary"
            :loading="loaderStore.loadingKey === 'LOGIN'"
          >
            Log in
          </Button>
        </form>

        <footer class="flex justify-between items-center">
          <ThemeToggler />
          <div class="flex items-center gap-1 lg:hidden">
            <Button icon tag="a" :href="TG_LINK" aria-label="Telegram Link">
              <Icon icon="akar-icons:telegram-fill" />
            </Button>
            <Button icon tag="a" :href="GH_LINK" aria-label="GitHub Link">
              <Icon icon="akar-icons:github-fill" />
            </Button>
          </div>
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useForm } from "slimeform"
import { GH_LINK, TG_LINK, SCHOOLS } from "../config"
import { isRequired } from "../utils"
import useLoaderStore from "../stores/loader"
import useSettingsStore from "../stores/settings"
import useHealthStore from "../stores/health"
import useAuthStore from "../stores/auth"
import Button from "../components/base/Button.vue"
import Input from "../components/base/Input.vue"
import Image from "../components/base/Image.vue"
import Icon from "../components/base/Icon.vue"
import Select from "../components/base/Select.vue"
import Checkbox from "../components/base/Checkbox.vue"
import ThemeToggler from "../components/layout/ThemeToggler.vue"
import Logo from "../components/base/app/Logo.vue"

const router = useRouter()
const authStore = useAuthStore()
const loaderStore = useLoaderStore()
const settingsStore = useSettingsStore()
const healthStore = useHealthStore()

const { captcha } = storeToRefs(authStore)
const { settings } = storeToRefs(settingsStore)

// Both probes are best-effort: a failure must never escape into the watcher
// flush (an unhandled throw there can wedge Vue's scheduler queue).
settingsStore.predictSchool().catch(() => {})

watch(
  () => settingsStore.settings.school,
  (school) => {
    if (school) healthStore.checkAvailability().catch(() => {})
  },
  {
    immediate: true,
  }
)

const { form, status, onSubmit } = useForm({
  form: () => ({
    login: "",
    password: "",
    captchaInput: "",
  }),
  rule: {
    login: [isRequired],
    password: [isRequired],
  },
})

const submit = async () => {
  try {
    await authStore.login({
      login: form.login,
      password: form.password,
      captchaInput: form.captchaInput,
    })
    router.push({ name: "diary" })
  } catch (error: any) {
    if (error.response?.data?.data?.base64img) {
      captcha.value = error.response.data.data.base64img
      form.captchaInput = ""
    }
    await healthStore.checkAvailability()
  }
}
</script>

<style scoped>
@reference "@/assets/globals.css";

/* Oversized leaf watermark: quiet depth on the flat brand panel. */
.watermark {
  opacity: 0.05;
  transform: rotate(-14deg);
  pointer-events: none;
}
.brand > :not(.watermark) {
  position: relative;
  z-index: 1;
}

.brand-link {
  @apply grid place-items-center w-9 h-9 rounded-full text-paper/70 bg-white/10 transition-colors;
}
.brand-link:hover {
  @apply bg-white/20 text-paper;
}
</style>
