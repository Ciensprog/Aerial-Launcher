export function compactNumber(
  value?: bigint | number | Intl.StringNumericLiteral
) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 3,
  }).format(value ?? 0)
}

export function numberWithCommaSeparator(
  value?: bigint | number | Intl.StringNumericLiteral
) {
  return Intl.NumberFormat('en-US').format(value ?? 0)
}
