export interface Chain {
  id: string;
  name: string;
  chainId: number;
  nativeCurrency: nativeCurrency;
  type: string;
}
interface nativeCurrency {
  symbol: string;
  decimals: number;
}
