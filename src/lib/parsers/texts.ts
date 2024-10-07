export function parseRedeemCodes(value: string) {
  const newValue = (value ?? '')
    .replace(/[^\w\n]+/gi, '')
    .replace(/\n+/g, '\n')
  const codes = newValue
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  const noRepeated = [...new Set(codes)]

  return noRepeated
}
