# NovaNIS Improvement Plan

Assessment date: 2026-07-06. Typecheck green across all 3 workspaces. Recent
history shows the heavy lifting is done: rebrand, security hardening, login
redesign, Render deploy. What's left is polish, hardening the few remaining
soft spots, and not undoing the good work with bloat.

## Current state (short)

**Good:** clean monorepo layout, thoughtful CSS system (theme presets, motion
kit, reduced-motion support), SPA fallback and caching on the API done right,
rate limiting + JWT with expiry, deliberate `any` policy documented in
types.ts, one real test where it matters most (crypto).

**Soft spots, in order of user impact:**

1. Working tree has uncommitted deploy/CI changes (modified ci.yml, deleted
   cd.yml and notFoundHandler, etc.). Unshipped work is a liability.
2. Fonts: `globals.css` imports 4 Google font families (Geist, Space Grotesk,
   Sora, Fraunces) via render-blocking `@import url(...)`, but only 1-2 are
   used per theme. Every visitor pays for all four, on every load, from a
   third-party origin.
3. PWA is manifest-only. No runtime caching, so "installable app" that shows
   a white screen offline and `theme_color` is fixed coral regardless of the
   selected theme preset.
4. Empty states are a bare emoticon. No text saying "no diary entries this
   term" and no retry action, so a failed load and a genuinely empty term look
   identical to the user.
5. One test in the repo (crypto). The grade-mapping logic in `Tabel.vue`
   (`gv()`: "true"/"false"/numeric strings from NIS) and the loader-queue
   drain in `api/index.ts` are the two branchiest untested paths.
6. `Tabel.vue` is 376 lines: view + grade-domain logic (gv, pill variants,
   averages) in one file. Fine today, but the domain logic is exactly what
   wants a unit test, and it can't be tested inside a `.vue` file easily.

## Plan

Ordered by value per unit of work. Each phase is independently shippable;
stop whenever the returns flatten.

### Phase 1: land what's in flight (minutes)

- Review and commit the uncommitted working-tree changes (deploy/CI cleanup).
  Run `/code-review` on the diff before committing.

### Phase 2: performance, fonts (small)

- Replace the Google Fonts `@import` with self-hosted subsets (fontsource
  packages) or at minimum `<link rel="preconnect">` + `<link>` in
  `index.html` so it doesn't block first paint.
- Load only the baseline font (Geist) eagerly; the three theme-preset fonts
  can load when their theme is activated. Measure with Lighthouse before and
  after so the win is real, not assumed.

### Phase 3: UX gaps (small) - DONE 2026-07-07 via /impeccable polish

- Done: empty vs error states in Diary/Tabel (distinct copy + Try again
  button), `guarded()` now reports success, dead `loaderStore.errors`
  deleted.
- Done along the way: legacy-token migration of the shared components
  (Modal, Button, Select, Checkbox, Notification), autocomplete bug in
  Input, broken toast transition choreography (zombie toasts), modal focus
  management + valid max-height, a11y labels, mobile nav focus rings.
- Follow-up for a later `/impeccable audit`: the pervasive
  `text-plum/40`–`/50` muted captions sit below 4.5:1 on light paper.
  New empty-state copy uses passing shades; the older captions are a
  design-wide shade decision.

### Phase 4: tests for the branchy bits (small)

- Extract `gv()` + averages from `Tabel.vue` into `src/utils/grades.ts` and
  add one `grades.test.ts` covering: numeric grades, "true"/"false"
  pass-fail, "none"/null/empty, and the average over mixed data.
- One test for the axios interceptor error path: response-less error still
  drains the loading queue (this was a real production bug, commit 3622d7c;
  a regression test locks the fix in).
- Vitest is already implied by the api's crypto.test.ts setup; reuse it, no
  new frameworks.

### Phase 5: PWA that earns the name (medium)

- Add Workbox runtime caching via the existing vite-plugin-pwa: cache-first
  for fonts/assets, network-first with fallback for the diary/grades API so
  the last-seen data shows offline.
- Add an offline indicator (one banner) so stale data is labeled as such.
- Sync `theme_color` meta with the active theme preset via one small watcher.

### Skipped, deliberately

- **Typing the NIS payloads fully.** types.ts documents why the upstream
  shapes stay `any`. 41 occurrences sounds bad but most are at the API
  boundary where full modelling adds noise, not safety. Type only what
  Phase 4 extracts.
- **Replacing axios with fetch.** The interceptor logic (loader queue, error
  normalization) is load-bearing and correct. A migration risks re-breaking
  fixed bugs for zero user value.
- **Component library / Storybook / e2e suite.** Two screens, one modal
  system. YAGNI.
- **i18n framework.** UI is consistently English today. Add i18n only when a
  second language is actually requested.
- **Visual redesign.** Already done and it's good. Any design-skill pass
  should be scoped to Phase 3's states audit only.

## Suggested skill usage per phase

| Phase | Skill |
|-------|-------|
| 1 | `/code-review` on the pending diff |
| 3 | `/impeccable` (scoped: states and edge cases only) |
| 2, 4, 5 | plain implementation, then `/verify` to prove it in the browser |
| anytime | `/ponytail-audit` if the repo ever starts feeling heavy |
