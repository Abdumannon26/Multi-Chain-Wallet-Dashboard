export interface NativeCurrency {
  symbol: string;
  decimals: number;
}

export interface Chain {
  id: string;
  name: string;
  chainId: number;
  nativeCurrency: NativeCurrency;
  type: string;
}
