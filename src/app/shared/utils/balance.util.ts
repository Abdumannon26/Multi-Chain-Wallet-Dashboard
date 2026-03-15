export function formatBalance(raw: string, decimals: number): number {

  const value = BigInt(raw)

  const divisor = BigInt(10 ** decimals)

  const result = Number(value) / Number(divisor)

  return Number(result.toFixed(6))
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value)
}
