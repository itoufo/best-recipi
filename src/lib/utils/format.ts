/**
 * 分数をISO 8601 duration形式に変換 (PT30M, PT1H30M)
 */
export function minutesToISO8601(minutes: number | null): string | undefined {
  if (!minutes) return undefined
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `PT${m}M`
  if (m === 0) return `PT${h}H`
  return `PT${h}H${m}M`
}

/**
 * 分数を日本語表記に変換
 */
export function minutesToJapanese(minutes: number | null): string {
  if (!minutes) return '−'
  if (minutes < 60) return `${minutes}分`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}時間`
  return `${h}時間${m}分`
}

/**
 * 日付を日本語フォーマット
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 栄養素の数値をフォーマット
 */
export function formatNutrient(value: number | null, unit: string): string {
  if (value === null || value === undefined) return '−'
  return `${value}${unit}`
}
