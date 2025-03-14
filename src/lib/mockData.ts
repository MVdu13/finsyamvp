
import { Asset, AssetAllocation, NetWorthHistory } from '@/types/assets';
import { Budget } from '@/types/budget';
import { FinancialGoal } from '@/types/goals';

// Generate mock data for assets
export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Compte Courant Principal',
    description: 'Compte pour dépenses quotidiennes',
    type: 'bank-account',
    value: 1000,
    performance: 0
  }
];

// Asset allocation
export const mockAssetAllocation: AssetAllocation = {
  stocks: 0,
  realEstate: 0,
  crypto: 0,
  cash: 0,
  bonds: 0,
  commodities: 0,
  other: 0,
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
      type: 'fixed',
    },
    {
      id: '2',
      name: 'Courses',
      amount: 400,
      category: 'Alimentation',
      frequency: 'monthly',
      essential: true,
      type: 'fixed',
    },
    {
      id: '3',
      name: 'Transport',
      amount: 150,
      category: 'Transport',
      frequency: 'monthly',
      essential: true,
      type: 'fixed',
    },
    {
      id: '4',
      name: 'Loisirs',
      amount: 300,
      category: 'Loisirs',
      frequency: 'monthly',
      essential: false,
      type: 'variable',
    },
    {
      id: '5',
      name: 'Abonnements',
      amount: 100,
      category: 'Abonnements',
      frequency: 'monthly',
      essential: false,
      type: 'variable',
    },
    {
      id: '6',
      name: 'Santé',
      amount: 50,
      category: 'Santé',
      frequency: 'monthly',
      essential: true,
      type: 'fixed',
    },
    {
      id: '7',
      name: 'Autres',
      amount: 600,
      category: 'Divers',
      frequency: 'monthly',
      essential: false,
      type: 'variable',
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
    500, 600, 700, 800, 850, 900,
    950, 980, 990, 995, 998, 1000
  ],
};
