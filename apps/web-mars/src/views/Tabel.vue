<template>
  <div class="max-w-[980px] mx-auto w-full">
    <header class="mb-5">
      <h1 class="font-display font-bold text-2xl tracking-tight">
        Report card
      </h1>
      <p class="text-sm text-plum/50 dark:text-paper/45 mt-0.5">
        {{ settings.year || "-" }} academic year
      </p>
    </header>

    <div
      v-if="!loaderStore.isLoading && !grades.length"
      class="surface rounded-xl py-16 px-6 flex flex-col items-center justify-center gap-4 text-center"
    >
      <div class="text-4xl text-plum/30 dark:text-paper/20">(·_·)</div>
      <p class="text-sm text-plum/70 dark:text-paper/60">
        {{ loadFailed ? "Couldn't load your report card." : "No grades for this year yet." }}
      </p>
      <Button v-if="loadFailed" rounded color="primary" @click="load(true)">
        Try again
      </Button>
    </div>

    <template v-else>
      <div
        class="surface animate-rise rounded-xl mb-4 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] dark:divide-white/[0.07]"
        :style="{ '--i': 0 }"
      >
        <div class="p-5 flex items-center gap-4">
          <div class="ring" :style="{ '--ring': ringPct }">
            <div class="ring-hole">
              <span
                class="font-display font-extrabold text-xl leading-none tabular-nums"
              >
                {{ average }}
              </span>
            </div>
          </div>
          <div>
            <div class="text-sm font-medium">Year GPA</div>
            <div class="text-xs text-plum/45 dark:text-paper/40 mt-0.5 tabular-nums">
              out of 5.0
            </div>
            <div
              v-if="Number(average) >= 4.5"
              class="inline-flex items-center mt-2 bg-coral/10 text-coral-strong dark:text-coral text-xs font-medium px-2 py-1 rounded-md"
            >
              Top student
            </div>
          </div>
        </div>

        <div class="p-5 flex flex-col">
          <div class="text-sm font-medium mb-3">Quarters</div>
          <div class="flex-1 flex items-end justify-between gap-3 min-h-[104px]">
            <div
              v-for="(q, i) in quarterAverages"
              :key="i"
              class="flex flex-col items-center gap-1.5"
            >
              <div
                class="bar w-8 rounded-t"
                :class="barColor(q)"
                :style="{ height: `${q ? 18 + (q / 5) * 78 : 5}px`, '--i': i }"
              ></div>
              <span class="text-[11px] text-plum/40 dark:text-paper/35">
                {{ ROMAN[i] }}
              </span>
              <span class="font-display font-semibold text-xs tabular-nums">
                {{ q ? q.toFixed(1) : "-" }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-5">
          <div class="text-sm font-medium mb-3">This year</div>
          <div class="flex flex-col gap-2">
            <div
              v-for="stat in summary"
              :key="stat.label"
              class="flex items-baseline gap-3"
            >
              <span
                class="font-display font-bold text-xl tabular-nums w-8 text-right"
                :class="stat.cls"
              >
                {{ stat.count }}
              </span>
              <span class="text-sm text-plum/60 dark:text-paper/55">
                {{ stat.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="surface animate-rise rounded-xl overflow-hidden overflow-x-auto"
        :style="{ '--i': 1 }"
      >
        <table class="w-full border-collapse min-w-[640px] tabular-nums">
          <thead>
            <tr
              class="text-plum/45 dark:text-paper/35 border-b border-black/[0.06] dark:border-white/[0.07]"
            >
              <th class="th-subject text-left font-display font-semibold text-[12px] px-4 py-3">
                Subject
              </th>
              <th v-for="c in ROMAN" :key="c" class="th-c">{{ c }}</th>
              <th class="th-c text-plum dark:text-paper">Year</th>
              <th class="th-c">Final</th>
              <th class="th-c">Exam</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            <tr
              v-for="(g, i) in grades"
              :key="i"
              class="grade-row"
              :style="{ '--i': i }"
            >
              <td class="td-subject text-left px-4 py-2.5 text-sm font-medium">
                {{ g.SubjectName }}
              </td>
              <td v-for="p in PERIODS" :key="p" class="td-c">
                <span :class="cell(gv(g[p]))">{{ gv(g[p]).t }}</span>
              </td>
              <td class="td-c">
                <span :class="chip(gv(g.Year))">{{ gv(g.Year).t }}</span>
              </td>
              <td class="td-c">
                <span :class="cell(gv(g.Final))">{{ gv(g.Final).t }}</span>
              </td>
              <td class="td-c">
                <span :class="cell(gv(g.Exam))">{{ gv(g.Exam).t }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from "vue"
import { storeToRefs } from "pinia"
import { useSession } from "../composables/useSession"
import useSettingsStore from "../stores/settings"
import useYearsStore from "../stores/years"
import useGradesStore from "../stores/grades"
import useLoaderStore from "../stores/loader"
import Button from "../components/base/Button.vue"

const ROMAN = ["I", "II", "III", "IV"]
const PERIODS = ["FirstPeriod", "SecondPeriod", "ThirdPeriod", "ForthPeriod"]

const settingsStore = useSettingsStore()
const yearsStore = useYearsStore()
const gradesStore = useGradesStore()
const loaderStore = useLoaderStore()
const { settings } = storeToRefs(settingsStore)
const { guarded } = useSession()

const grades = computed<any[]>(() => gradesStore.grades)
const loadFailed = ref(false)

const load = async (force = false) => {
  loadFailed.value = !(await guarded(async () => {
    await yearsStore.fetchYears(force)
    await gradesStore.fetchGrades(force)
  }))
}

// Force on open so cached grades are refreshed; a year change hits a new cache
// key, so it fetches fresh without forcing.
onMounted(() => load(true))
watch(
  () => settings.value.year,
  (ny, oy) => {
    if (oy && ny && ny !== oy) load()
  }
)

type View = { t: string; k: "good" | "ok" | "low" | "pass" | "fail" | "none" }
const gv = (v: any): View => {
  if (v === "none" || v == null || v === "") return { t: "-", k: "none" }
  if (v === "true") return { t: "P", k: "pass" }
  if (v === "false") return { t: "F", k: "fail" }
  const n = Number(v)
  if (n >= 5) return { t: "5", k: "good" }
  if (n === 4) return { t: "4", k: "ok" }
  return { t: String(v), k: "low" }
}

/* Quarters, final and exam read as colored figures; the year result gets a
   tinted chip, since it is the number the whole table exists for. */
const textColors: Record<string, string> = {
  good: "text-good-strong dark:text-good",
  ok: "text-amber-700 dark:text-ok",
  pass: "text-pass-strong dark:text-pass",
  low: "text-red-600 dark:text-red-400",
  fail: "text-red-600 dark:text-red-400",
}
const chipColors: Record<string, string> = {
  good: "bg-good/15 text-good-strong dark:text-good",
  ok: "bg-ok/20 text-amber-700 dark:text-ok",
  pass: "bg-pass/15 text-pass-strong dark:text-pass",
  low: "bg-red-500/10 text-red-600 dark:text-red-400",
  fail: "bg-red-500/10 text-red-600 dark:text-red-400",
}
const cell = (view: View) => {
  if (view.k === "none") return "text-sm text-plum/25 dark:text-paper/20"
  return `text-sm font-semibold ${textColors[view.k]}`
}
const chip = (view: View) => {
  if (view.k === "none")
    return "inline-grid place-items-center min-w-[30px] h-7 px-2 text-sm text-plum/25 dark:text-paper/20"
  return `inline-grid place-items-center min-w-[30px] h-7 px-2 rounded-md font-display font-bold text-sm ${chipColors[view.k]}`
}

const numericYears = computed(() =>
  grades.value.map((g) => Number(g.Year)).filter((n) => !isNaN(n) && n > 0)
)
const average = computed(() => {
  const n = numericYears.value
  if (!n.length) return "0.0"
  return (n.reduce((a, b) => a + b, 0) / n.length).toFixed(1)
})
// Animate the conic ring from 0 up to the score (transition on the registered --ring).
const ringPct = ref("0%")
watch(
  average,
  (v) => {
    const pct = (Number(v) / 5) * 100
    nextTick(() => (ringPct.value = `${pct}%`))
  },
  { immediate: true }
)

const count = (pred: (g: any) => boolean) => grades.value.filter(pred).length
const summary = computed(() => [
  {
    label: "fives",
    count: count((g) => g.Year === "5"),
    cls: "text-good-strong dark:text-good",
  },
  {
    label: "fours",
    count: count((g) => g.Year === "4"),
    cls: "text-amber-700 dark:text-ok",
  },
  {
    label: "passes",
    count: count((g) => g.Year === "true"),
    cls: "text-pass-strong dark:text-pass",
  },
])

const quarterAverages = computed(() =>
  PERIODS.map((p) => {
    const nums = grades.value
      .map((g) => Number(g[p]))
      .filter((n) => !isNaN(n) && n > 0)
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
  })
)
const barColor = (q: number) =>
  q >= 4.5
    ? "bg-good"
    : q >= 3.5
      ? "bg-ok"
      : q > 0
        ? "bg-red-400"
        : "bg-black/10 dark:bg-white/10"
</script>

<style scoped>
@reference "@/assets/globals.css";

.th-c {
  @apply text-center font-display font-semibold text-[12px] px-2 py-3 w-14;
}
.td-c {
  @apply text-center px-2 py-2.5;
}

/* Animatable conic ring (grows from 0 to the score) starting at 12 o'clock. */
.ring {
  @apply grid place-items-center w-[84px] h-[84px] rounded-full shrink-0;
  background: conic-gradient(
    from -90deg,
    var(--color-coral) 0% var(--ring),
    rgba(127, 127, 127, 0.15) var(--ring) 100%
  );
  transition: --ring 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.ring-hole {
  @apply grid place-items-center w-[62px] h-[62px] rounded-full bg-paper-card dark:bg-plum-card;
}

/* Quarter bars grow up on load and ease between years. */
.bar {
  transform-origin: bottom;
  transition: height 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  animation: grow 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms + 250ms);
}
@keyframes grow {
  from {
    transform: scaleY(0);
  }
}

/* Table rows: staggered entrance + hover highlight. */
.grade-row {
  animation: rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(min(var(--i, 0), 12) * 40ms + 300ms);
  transition: background-color 0.15s ease;
}
.grade-row:hover {
  @apply bg-black/[0.025] dark:bg-white/[0.03];
}

/* Keep the subject column pinned while grade columns scroll on narrow screens. */
.th-subject,
.td-subject {
  @apply sticky left-0 z-10 bg-paper-card dark:bg-plum-card;
}
</style>
