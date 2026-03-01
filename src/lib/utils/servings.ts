/**
 * 分量を人数に応じて調整する
 */
export function adjustQuantity(
  quantity: string | null,
  originalServings: number,
  targetServings: number
): string | null {
  if (!quantity) return quantity
  const trimmed = quantity.trim()

  // "適量", "少々", "お好みで" etc. - 調整不可
  if (/[^\d./\s]/.test(trimmed) && !trimmed.match(/^\d/)) {
    return trimmed
  }

  // "1/2" 形式の分数
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/)
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1])
    const denominator = parseInt(fractionMatch[2])
    const value = (numerator / denominator) * (targetServings / originalServings)
    return formatFraction(value)
  }

  // "1.5" or "2" 形式の数値
  const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (numMatch) {
    const value = parseFloat(numMatch[1]) * (targetServings / originalServings)
    const suffix = numMatch[2] || ''
    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '')
    return formatted + suffix
  }

  return trimmed
}

function formatFraction(value: number): string {
  const fractions: [number, string][] = [
    [0.25, '1/4'],
    [0.333, '1/3'],
    [0.5, '1/2'],
    [0.667, '2/3'],
    [0.75, '3/4'],
  ]

  for (const [target, label] of fractions) {
    if (Math.abs(value - target) < 0.05) return label
  }

  if (Number.isInteger(value)) return value.toString()

  const whole = Math.floor(value)
  const remainder = value - whole
  for (const [target, label] of fractions) {
    if (Math.abs(remainder - target) < 0.05) {
      return whole > 0 ? `${whole} ${label}` : label
    }
  }

  return value.toFixed(1).replace(/\.0$/, '')
}
