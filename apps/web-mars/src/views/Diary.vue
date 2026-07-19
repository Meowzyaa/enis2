<template>
  <div class="max-w-[640px] mx-auto w-full">
    <header class="mb-5">
      <h1 class="font-display font-bold text-2xl tracking-tight">Diary</h1>
      <p class="text-sm text-plum/50 dark:text-paper/45 mt-0.5">
        {{ settings.year || "-" }} academic year
      </p>
    </header>

    <div class="surface rounded-lg p-1 flex gap-1 mb-4">
      <button
        v-for="(term, index) in termsStore.terms"
        :key="`${index}-${term.Id}`"
        class="tab flex-1 h-9 rounded-md font-display font-semibold text-sm default-focus"
        :class="
          settings.tab === term.Name
            ? 'bg-coral text-plum-deep'
            : 'text-plum/45 dark:text-paper/40 hover:text-plum dark:hover:text-paper'
        "
        @click="settings.tab = term.Name"
      >
        {{ GREEK_NUMERALS[Number(index) + 1] }}
      </button>
    </div>

    <!-- First load: skeleton rows shaped like the list they become. -->
    <div
      v-if="loaderStore.isLoading && !diaryStore.diary.length"
      class="surface rounded-xl overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.07]"
      aria-hidden="true"
    >
      <div
        v-for="i in 7"
        :key="i"
        class="p-4 space-y-3 animate-pulse"
        :style="{ animationDelay: `${(i - 1) * 90}ms` }"
      >
        <div class="h-4 w-2/5 rounded bg-black/10 dark:bg-white/10" />
        <div class="flex justify-between">
          <div class="h-5 w-16 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
          <div class="h-5 w-10 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
        </div>
      </div>
    </div>

    <div
      v-else-if="!loaderStore.isLoading && !diaryStore.diary.length"
      class="surface rounded-xl py-16 px-6 flex flex-col items-center justify-center gap-4 text-center"
    >
      <div class="text-4xl text-plum/30 dark:text-paper/20">{{ emoticon }}</div>
      <p class="text-sm text-plum/70 dark:text-paper/60">
        {{ loadFailed ? "Couldn't load your diary." : "Nothing here for this term." }}
      </p>
      <Button v-if="loadFailed" rounded color="primary" @click="load(true, true)">
        Try again
      </Button>
    </div>

    <div
      v-else
      class="surface rounded-xl overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.07]"
    >
      <SubjectDiary
        v-for="(item, index) in diaryStore.diary"
        :key="item.Name || index"
        class="animate-rise"
        :style="{ '--i': index }"
        :subject="item"
        @click="openSubjectModal(item)"
      />
    </div>

    <Modal :show="showSubjectModal" @close="showSubjectModal = false">
      <SubjectContainer />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { storeToRefs } from "pinia"
import { getRandomItem } from "../utils"
import { useSession } from "../composables/useSession"
import useSettingsStore from "../stores/settings"
import useYearsStore from "../stores/years"
import useTermsStore from "../stores/terms"
import useDiaryStore from "../stores/diary"
import useLoaderStore from "../stores/loader"
import useSubjectStore from "../stores/subject"
import SubjectDiary from "../components/layout/subject/SubjectDiary.vue"
import SubjectContainer from "../components/layout/modal-containers/SubjectContainer.vue"
import Modal from "../components/base/Modal.vue"
import Button from "../components/base/Button.vue"

const GREEK_NUMERALS: Record<number, string> = { 1: "I", 2: "II", 3: "III", 4: "IV" }
const emoticons = ["¯\\_(ツ)_/¯", "(≥o≤)", "(>_<)", "(·_·)", "(˚Δ˚)b", "(·.·)"]

const settingsStore = useSettingsStore()
const yearsStore = useYearsStore()
const termsStore = useTermsStore()
const diaryStore = useDiaryStore()
const loaderStore = useLoaderStore()
const subjectStore = useSubjectStore()
const { settings } = storeToRefs(settingsStore)
const { guarded } = useSession()

const emoticon = getRandomItem(emoticons)
const showSubjectModal = ref(false)
const loadFailed = ref(false)

const load = async (includeTabs: boolean, force = false) => {
  loadFailed.value = !(await guarded(async () => {
    if (includeTabs) {
      await yearsStore.fetchYears(force)
      await termsStore.fetchTerms(force)
    }
    await diaryStore.fetchDiary(force)
  }))
}

// Force on open so cached data is refreshed; year/tab changes hit new cache
// keys, so they fetch fresh without forcing.
onMounted(() => load(true, true))

watch(
  [() => settings.value.year, () => settings.value.tab],
  ([ny, nt], [oy, ot]) => {
    if (oy && ny && ny !== oy) return load(true)
    if (ot && nt && nt !== ot) return load(false)
  }
)

const openSubjectModal = async (subj: any) => {
  if (
    showSubjectModal.value &&
    subj.Name === subjectStore.subject.originalSubject.Name
  ) {
    return
  }
  subjectStore.clearSubject()
  showSubjectModal.value = true
  await guarded(() => subjectStore.fetchSubject(subj))
}
</script>

<style scoped>
.tab {
  transition:
    transform 160ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 0.18s ease,
    color 0.18s ease;
}
.tab:active {
  transform: scale(0.97);
}
</style>
