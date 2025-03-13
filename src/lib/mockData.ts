
import { Asset, AssetAllocation, NetWorthHistory } from '@/types/assets';
import { Budget } from '@/types/budget';
import { FinancialGoal } from '@/types/goals';

// Generate mock data for assets
export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Actions Apple',
    description: '10 actions à 150€',
    type: 'stock',
    value: 1500,
    performance: 12.5,
    createdAt: '2023-04-12T10:00:00.000Z',
    updatedAt: '2023-08-24T14:30:00.000Z',
  },
  {
    id: '2',
    name: 'Bitcoin',
    description: '0.05 BTC',
    type: 'crypto',
    value: 2000,
    performance: -5.2,
    createdAt: '2023-01-15T11:20:00.000Z',
    updatedAt: '2023-08-24T14:30:00.000Z',
  },
  {
    id: '3',
    name: 'Appartement Paris',
    description: 'T2 - Locatif',
    type: 'real-estate',
    value: 250000,
    performance: 3.7,
    createdAt: '2022-06-01T09:15:00.000Z',
    updatedAt: '2023-08-24T14:30:00.000Z',
  },
  {
    id: '4',
    name: 'Livret A',
    description: 'Épargne sécurisée',
    type: 'cash',
    value: 15000,
    performance: 3,
    createdAt: '2021-12-05T16:45:00.000Z',
    updatedAt: '2023-08-24T14:30:00.000Z',
  },
  {
    id: '5',
    name: 'ETF World',
    description: 'MSCI World',
    type: 'stock',
    value: 8000,
    performance: 6.8,
    createdAt: '2022-09-20T13:10:00.000Z',
    updatedAt: '2023-08-24T14:30:00.000Z',
  },
  {
    id: '6',
    name: 'Ethereum',
    description: '1.2 ETH',
    type: 'crypto',
    value: 2500,
    performance: 15.3,
    createdAt: '2023-02-18T10:30:00.000Z',
    updatedAt: '2023-08-24T14:30:00.000Z',
  },
];

// Asset allocation
export const mockAssetAllocation: AssetAllocation = {
  stocks: 9500,
  realEstate: 250000,
  crypto: 4500,
  cash: 15000,
  bonds: 0,
  commodities: 0,
  other: 1000,
};

// Budget
export const mockBudget: Budget = {
  totalIncome: 4500,
  totalExpenses: 2800,
  savings: 1000,
  investment: 700,
  incomes: [
    {
      id: '1',
      name: 'Salaire',
      amount: 3500,
      frequency: 'monthly',
    },
    {
      id: '2',
      name: 'Revenus locatifs',
      amount: 1000,
      frequency: 'monthly',
    },
  ],
  expenses: [
    {
      id: '1',
      name: 'Loyer',
      amount: 1200,
      category: 'Logement',
      frequency: 'monthly',
      essential: true,
    },
    {
      id: '2',
      name: 'Courses',
      amount: 400,
      category: 'Alimentation',
      frequency: 'monthly',
      essential: true,
    },
    {
      id: '3',
      name: 'Transport',
      amount: 150,
      category: 'Transport',
      frequency: 'monthly',
      essential: true,
    },
    {
      id: '4',
      name: 'Loisirs',
      amount: 300,
      category: 'Loisirs',
      frequency: 'monthly',
      essential: false,
    },
    {
      id: '5',
      name: 'Abonnements',
      amount: 100,
      category: 'Abonnements',
      frequency: 'monthly',
      essential: false,
    },
    {
      id: '6',
      name: 'Santé',
      amount: 50,
      category: 'Santé',
      frequency: 'monthly',
      essential: true,
    },
    {
      id: '7',
      name: 'Autres',
      amount: 600,
      category: 'Divers',
      frequency: 'monthly',
      essential: false,
    },
  ],
};

// Financial goals
export const mockGoals: FinancialGoal[] = [
  {
    id: '1',
    name: 'Achat immobilier',
    description: 'Apport pour achat résidence principale',
    type: 'savings',
    targetAmount: 40000,
    currentAmount: 15000,
    monthlyContribution: 500,
    startDate: '2023-01-01T00:00:00.000Z',
    targetDate: '2025-01-01T00:00:00.000Z',
    priority: 'high',
    timeframe: '2 ans',
  },
  {
    id: '2',
    name: 'Voyage au Japon',
    description: 'Voyage de 3 semaines',
    type: 'project',
    targetAmount: 6000,
    currentAmount: 2400,
    monthlyContribution: 300,
    startDate: '2023-03-01T00:00:00.000Z',
    targetDate: '2024-06-01T00:00:00.000Z',
    priority: 'medium',
    timeframe: '1 an',
  },
  {
    id: '3',
    name: 'Investissement ETF',
    description: 'Portefeuille long terme',
    type: 'investment',
    targetAmount: 100000,
    currentAmount: 8000,
    monthlyContribution: 400,
    startDate: '2022-06-01T00:00:00.000Z',
    targetDate: '2032-06-01T00:00:00.000Z',
    priority: 'low',
    timeframe: '10 ans',
  },
];

// Net worth history
export const mockNetWorthHistory: NetWorthHistory = {
  dates: [
    'Jan 2023', 'Fév 2023', 'Mar 2023', 'Avr 2023', 'Mai 2023', 'Juin 2023',
    'Juil 2023', 'Août 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Déc 2023'
  ],
  values: [
    250000, 255000, 260000, 258000, 262000, 268000,
    272000, 275000, 273000, 278000, 280000, 283000
  ],
};
