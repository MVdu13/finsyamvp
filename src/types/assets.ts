
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
}

export interface AssetClass {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
