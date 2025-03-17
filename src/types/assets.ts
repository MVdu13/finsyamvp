
export type AssetType = 
  | 'stock' 
  | 'crypto' 
  | 'real-estate' 
  | 'cash' 
  | 'bonds' 
  | 'commodities' 
  | 'other'
  | 'bank-account'
  | 'savings-account'
  | 'investment-account'
  | 'crypto-account';

export interface Transaction {
  id: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
  type: 'buy' | 'sell';
  performance?: number;
}

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
  
  // Investment account specific
  accountType?: 'PEA' | 'CTO' | 'Assurance Vie' | 'PER' | 'Autre';
  
  // Crypto account specific
  cryptoAccountType?: 'Binance' | 'BitGet' | 'KuCoin' | 'Metamask' | 'Phantom' | 'Autre';
  
  // Stock specific
  investmentAccountId?: string;
  
  // Crypto specific
  cryptoAccountId?: string;
  
  transactions?: Transaction[];
  
  // Real estate specific properties
  propertyType?: 'apartment' | 'house' | 'building' | 'commercial' | 'land' | 'other';
  usageType?: 'main' | 'secondary' | 'rental';
  surface?: number;
  propertyTax?: number;
  housingTax?: number;
  annualRent?: number;
  annualFees?: number;
  annualCharges?: number;
}

export interface AssetAllocation {
  stocks: number;
  realEstate: number;
  crypto: number;
  bankAccounts: number;
  savingsAccounts: number;
  bonds: number;
  commodities: number;
  other: number;
}

export interface AssetClass {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface NetWorthHistory {
  dates: string[];
  values: number[];
}
