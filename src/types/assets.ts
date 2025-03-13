
export type AssetType = 'stock' | 'crypto' | 'real-estate' | 'cash' | 'bonds' | 'commodities' | 'other';

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: AssetType;
  value: number;
  performance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAllocation {
  stocks: number;
  realEstate: number;
  crypto: number;
  cash: number;
  bonds: number;
  commodities: number;
  other: number;
}

export interface NetWorthHistory {
  dates: string[];
  values: number[];
}
