/**
 * Shortens a transaction hash for display (e.g. 0x1234...5678).
 */
export function shortHash(hash: string, start = 6, end = 4): string {
  if (!hash || hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
}

/**
 * Shortens an address for display.
 */
export function shortAddress(address: string, start = 6, end = 4): string {
  return shortHash(address, start, end);
}

/**
 * Formats a Unix timestamp (seconds) for display.
 */
export function formatTxDate(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp * 1000);
}
