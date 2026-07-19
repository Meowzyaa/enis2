type Query = Record<string, unknown>

const getSum = (array: any[], query: string): number => {
  return array.reduce((t, c) => t + c[query], 0)
}

export const getSectionsScores = (sections: any[]) => {
  const filteredSections = sections.filter((s) => s.Score !== -1)
  return {
    score: getSum(filteredSections, "Score"),
    max: getSum(filteredSections, "MaxScore"),
  }
}

export const formatPercent = (percent: number): string => {
  // Guards a 0 max-score division upstream rendering as "Infinity%".
  if (!Number.isFinite(percent)) return "0"
  return Number(percent ? percent.toFixed(2) : 0).toString()
}

export const getPercent = (SAU: any[], SAT: any[]): string => {
  const { score: SAUscores, max: SAUmaxScores } = getSectionsScores(SAU)
  const { score: SATscores, max: SATmaxScores } = getSectionsScores(SAT)
  const SAUpart = SAUscores / (2 * SAUmaxScores)
  const SATpart = SATscores / (2 * SATmaxScores)
  return formatPercent((SAUpart + SATpart) * 100)
}

export const getPercentDecimals = (percent: number | string) => {
  const [before, after] = `${percent}`.split(".")
  return { before, after }
}

export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const findByQuery = (i: any, query: Query): boolean => {
  // A record missing the queried field is a non-match, not a crash.
  return Object.entries(query).every(([k, v]) =>
    i[k]?.toString().includes(v as string)
  )
}

export const findItem = <T = any>(array: T[], query: Query): T | undefined => {
  return array.find((i) => findByQuery(i, query))
}

export const findIndex = (array: any[], query: Query) => {
  const idx = array.findIndex((i) => findByQuery(i, query))
  const index = idx === -1 ? null : idx
  const exists = index !== null
  return { index, exists }
}

export const between = (x: number, min: number, max: number): boolean => {
  return x >= min && x <= max
}

export const isRequired = (value: string): true | string => {
  if (value && value.trim()) {
    return true
  }
  return "Required"
}
