export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}


export function isValidSolanaAddress(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 32 || trimmed.length > 44) return false;
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed) && !trimmed.startsWith('0x');
}

export function validateAddress(address: string, chainType?: string): { valid: boolean; error?: string } {
  const addr = address.trim();
  if (!addr) return { valid: false, error: 'Введите адрес кошелька' };
  if (chainType === 'solana') {
    if (!isValidSolanaAddress(addr)) return { valid: false, error: 'Неверный формат Solana-адреса (32–44 символа, base58)' };
  } else {
    if (!isValidEvmAddress(addr)) return { valid: false, error: 'Неверный формат EVM-адреса (0x + 40 hex символов)' };
  }
  return { valid: true };
}
