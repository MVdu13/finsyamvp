
import React from 'react';
import { CircleDollarSign, ArrowUpCircle, ArrowDownCircle, PiggyBank, TrendingUp } from 'lucide-react';
import { Budget } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import DonutChart from '../charts/DonutChart';

interface BudgetOverviewProps {
  budget: Budget;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget }) => {
  const chartData = {
    labels: ['Revenu', 'Dépenses', 'Épargne', 'Investissement'],
    values: [
      budget.totalIncome,
      budget.totalExpenses,
      budget.savings,
      budget.investment
    ],
    colors: ['#4ade80', '#f87171', '#60a5fa', '#FA5003']
  };

  return (
    <div className="wealth-card h-full flex flex-col">
      <h3 className="text-lg font-medium mb-5">Aperçu du budget</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="text-green-500" size={20} />
            <span className="text-sm font-medium">Revenus</span>
          </div>
          <p className="text-xl font-semibold">{formatCurrency(budget.totalIncome)}</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="text-red-500" size={20} />
            <span className="text-sm font-medium">Dépenses</span>
          </div>
          <p className="text-xl font-semibold">{formatCurrency(budget.totalExpenses)}</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="text-blue-500" size={20} />
            <span className="text-sm font-medium">Épargne</span>
          </div>
          <p className="text-xl font-semibold">{formatCurrency(budget.savings)}</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-wealth-primary" size={20} />
            <span className="text-sm font-medium">Investissement</span>
          </div>
          <p className="text-xl font-semibold">{formatCurrency(budget.investment)}</p>
        </div>
      </div>
      
      <div className="flex-grow">
        <DonutChart data={chartData} height={240} />
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-sm">
          <div className="mb-2">
            <span className="text-muted-foreground">Solde mensuel:</span>{' '}
            <span className="font-medium text-green-600">+{formatCurrency(budget.totalIncome - budget.totalExpenses)}</span>
          </div>
          
          <div className="mb-2">
            <span className="text-muted-foreground">Taux d'épargne:</span>{' '}
            <span className="font-medium">{Math.round((budget.savings / budget.totalIncome) * 100)}%</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Taux d'investissement:</span>{' '}
            <span className="font-medium">{Math.round((budget.investment / budget.totalIncome) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
