
import React, { useState, useEffect } from 'react';
import { Budget } from '@/types/budget';
import DonutChart from '@/components/charts/DonutChart';
import { formatCurrency } from '@/lib/formatters';
import { FinancialGoal } from '@/types/goals';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetDistributionProps {
  budget: Budget;
  savingsAccountsTotal?: number;
}

const BudgetDistribution: React.FC<BudgetDistributionProps> = ({ 
  budget, 
  savingsAccountsTotal = 15000 // Default value if not provided
}) => {
  const [projects, setProjects] = useState<FinancialGoal[]>([]);
  
  // Load projects from localStorage on component mount and when component updates
  useEffect(() => {
    const savedProjects = localStorage.getItem('financial-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);
  
  // Calculate total for fixed and variable expenses
  const fixedExpenses = budget.expenses
    .filter(expense => expense.type === 'fixed')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const variableExpenses = budget.expenses
    .filter(expense => expense.type === 'variable')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total monthly contribution for projects from localStorage
  const monthlyProjectsContribution = projects.reduce(
    (sum, goal) => sum + goal.monthlyContribution, 
    0
  );
  
  // Calculate total expenses (fixed + variable)
  const totalExpenses = fixedExpenses + variableExpenses;
  
  // Calculate investment amount (remaining after fixed, variable expenses and projects)
  const investmentAmount = Math.max(0, budget.totalIncome - totalExpenses - monthlyProjectsContribution);
  
  // Prepare data for the donut chart - simplified to just 4 categories
  const chartData = {
    labels: ['Dépenses fixes', 'Dépenses variables', 'Projets financiers', 'Investissement'],
    values: [
      fixedExpenses,
      variableExpenses,
      monthlyProjectsContribution,
      investmentAmount
    ],
    colors: [
      '#F97316', // Orange for fixed expenses
      '#FB923C', // Lighter orange for variable expenses
      '#A855F7', // Purple for projects
      '#0EA5E9', // Blue for investments
    ],
  };

  // Remove any categories with zero value
  const filteredLabels = [];
  const filteredValues = [];
  const filteredColors = [];
  
  chartData.values.forEach((value, index) => {
    if (value > 0) {
      filteredLabels.push(chartData.labels[index]);
      filteredValues.push(value);
      filteredColors.push(chartData.colors[index]);
    }
  });

  const finalChartData = {
    labels: filteredLabels,
    values: filteredValues,
    colors: filteredColors,
  };

  // Mockup accounts data for display
  const accounts = [
    { 
      id: '1', 
      name: 'Compte Courant', 
      type: 'bank-account', 
      bank: 'BNP Paribas',
      balance: 3500,
      monthlyChange: 2.3
    },
    { 
      id: '2', 
      name: 'Livret A', 
      type: 'savings-account', 
      bank: 'Société Générale',
      balance: 7800,
      monthlyChange: 0.5
    },
    { 
      id: '3', 
      name: 'PEL', 
      type: 'savings-account', 
      bank: 'Crédit Agricole',
      balance: 12500,
      monthlyChange: 0.3
    },
    { 
      id: '4', 
      name: 'PEA', 
      type: 'investment-account', 
      bank: 'Boursorama',
      balance: 8200,
      monthlyChange: -1.5
    }
  ];

  // Calculate total account balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="wealth-card">
      <h3 className="text-lg font-medium mb-4">Répartition des revenus</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DonutChart 
            data={finalChartData} 
            height={250}
          />
        </div>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-3">
            {finalChartData.labels.map((label, index) => (
              <div key={label} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: finalChartData.colors[index] }}
                  ></div>
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(finalChartData.values[index])}
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-medium">{formatCurrency(budget.totalIncome)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Accounts section - Added below the chart */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Vos Comptes</h3>
        <div className="space-y-3">
          {accounts.map(account => (
            <Card key={account.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-primary" size={20} />
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">{account.bank}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(account.balance)}</div>
                    <div className={cn(
                      "text-xs flex items-center justify-end",
                      account.monthlyChange >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {account.monthlyChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span className="ml-1">
                        {account.monthlyChange > 0 ? "+" : ""}{account.monthlyChange.toFixed(1)}% ce mois
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center bg-muted p-4 rounded-md">
          <span className="font-medium">Total comptes</span>
          <span className="font-medium">{formatCurrency(totalBalance)}</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetDistribution;
