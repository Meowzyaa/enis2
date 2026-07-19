export const getCurrentQuarter = () => {
  const oneDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const year = now.getFullYear()

  const start = new Date(year, 0, 0).getTime()
  const dayOfYear = (date: Date) => Math.floor((date.getTime() - start) / oneDay)

  const day = dayOfYear(now)

  // Quarter boundaries (immutable - no in-place Date mutation).
  const firstQuarterEnd = dayOfYear(new Date(year, 10, 6))
  const secondQuarterEnd = dayOfYear(new Date(year, 0, 9))
  const thirdQuarterEnd = dayOfYear(new Date(year, 2, 27))
  const fourthQuarterEnd = dayOfYear(new Date(year, 8, 15))

  if (day > fourthQuarterEnd && day <= firstQuarterEnd) return 1
  if (day > firstQuarterEnd || day <= secondQuarterEnd) return 2
  if (day > secondQuarterEnd && day <= thirdQuarterEnd) return 3
  if (day > thirdQuarterEnd && day <= fourthQuarterEnd) return 4

  return 1
}
