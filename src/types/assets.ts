
export type AssetType = 
  | 'stock' 
  | 'crypto' 
  | 'real-estate' 
  | 'cash' 
  | 'bonds' 
  | 'commodities' 
  | 'other'
  | 'bank-account'
  | 'savings-account';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  performance?: number;
  icon?: string;
  currency?: string;
  change24h?: number;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  quantity?: number;
  symbol?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Add the AssetAllocation type that was referenced but missing
export interface AssetAllocation {
  stocks: number;
  realEstate: number;
  crypto: number;
  cash: number;
  bonds: number;
  commodities: number;
  other: number;
}

// Add the AssetClass type that was previously defined
export interface AssetClass {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// Add the NetWorthHistory type that was referenced but missing
export interface NetWorthHistory {
  dates: string[];
  values: number[];
}
