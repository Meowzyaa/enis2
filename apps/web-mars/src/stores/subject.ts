import { ref, reactive, computed } from "vue"
import { defineStore } from "pinia"
import { getSubject } from "../api"
import { getPercent } from "../utils"

export default defineStore("subject", () => {
  // Factory, not a shared object: Object.assign would otherwise alias the
  // nested arrays into the reactive state, and GM edits would pollute the
  // "clean" state that clearSubject restores.
  const initialState = () => ({
    customSections: {
      SAU: [] as any[],
      SAT: [] as any[],
    },
    originalSections: {
      SAU: [] as any[],
      SAT: [] as any[],
    },
    originalSubject: {} as Record<string, any>,
  })
  const subject = reactive(initialState())
  const GM = ref(false)

  const customSubject = computed(() => {
    return {
      ...subject.originalSubject,
      Score: getPercent(subject.customSections.SAU, subject.customSections.SAT),
    }
  })

  const clearSubject = () => {
    Object.assign(subject, initialState())
    GM.value = false
  }

  const fetchSubject = async (subj: any) => {
    subject.originalSubject = subj
    try {
      const [SAU, SAT] = await getSubject(subj.JournalId, subj.Evaluations)
      const sections = { SAU, SAT }
      subject.originalSections = sections
      subject.customSections = JSON.parse(JSON.stringify(sections))
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return {
    subject,
    GM,
    customSubject,
    fetchSubject,
    clearSubject,
  }
})
