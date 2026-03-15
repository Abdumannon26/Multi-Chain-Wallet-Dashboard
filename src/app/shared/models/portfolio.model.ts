export interface NativeBalance {
  symbol: string;
  balance: string;
  rawBalance: string;
  decimals: number;
  usdValue: number;
}

export interface PortfolioToken {
  symbol: string;
  balance: string;
  rawBalance: string;
  decimals: number;
  usdValue: number;
  address: string;
}

export interface Portfolio {
  address: string;
  chain: string;
  nativeBalance: NativeBalance;
  tokens: PortfolioToken[];
  totalUsdValue: number;
}
