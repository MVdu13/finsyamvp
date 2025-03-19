
export interface Income {
  id: string;
  name: string;
  amount: number;
  monthlyAmount?: number; // For total calculations
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  icon?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  monthlyAmount?: number; // For total calculations
  category: string;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  essential: boolean;
  type: 'fixed' | 'variable'; // New field to distinguish between fixed and variable expenses
}

export interface Budget {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  investment: number;
  incomes: Income[];
  expenses: Expense[];
}
