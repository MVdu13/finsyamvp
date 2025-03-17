
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
  | 'investment-account';

export interface Transaction {
  id: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
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
  
  // Stock specific
  investmentAccountId?: string;
  ticker?: string;  // Ajout d'un champ ticker pour identifier les actions similaires
  transactions?: Transaction[]; // Historique des transactions
  
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

// Updated AssetAllocation type to include separate properties for bank accounts and savings accounts
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
