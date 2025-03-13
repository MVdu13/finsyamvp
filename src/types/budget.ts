
export interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  icon?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  essential: boolean;
}

export interface Budget {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  investment: number;
  incomes: Income[];
  expenses: Expense[];
}
