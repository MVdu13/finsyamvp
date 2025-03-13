
import React from 'react';
import { CircleDollarSign, ArrowUpCircle, ArrowDownCircle, PiggyBank, TrendingUp } from 'lucide-react';
import { Budget } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';

interface BudgetOverviewProps {
  budget: Budget;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget }) => {
  // Calculate total for essential and non-essential expenses
  const essentialExpenses = budget.expenses
    .filter(expense => expense.essential)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const nonEssentialExpenses = budget.expenses
    .filter(expense => !expense.essential)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category for visualization
  const expensesByCategory = budget.expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, amountA], [, amountB]) => amountB - amountA);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Revenus détaillés */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Détail des revenus</h4>
          <div className="space-y-3">
            {budget.incomes.map((income) => (
              <div key={income.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">{income.name}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(income.amount)}</span>
              </div>
            ))}
            
            {budget.incomes.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun revenu enregistré</p>
            )}
          </div>
        </div>
        
        {/* Dépenses par catégorie */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Dépenses par catégorie</h4>
          <div className="space-y-3">
            {sortedCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm">{category}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
            
            {sortedCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune dépense enregistrée</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Répartition des dépenses</h4>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${(essentialExpenses / budget.totalExpenses) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs mt-1">Essentielles: {formatCurrency(essentialExpenses)}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-orange-400 h-2.5 rounded-full" 
                    style={{ width: `${(nonEssentialExpenses / budget.totalExpenses) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs mt-1">Non-essentielles: {formatCurrency(nonEssentialExpenses)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Solde mensuel</h4>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">Revenus - Dépenses:</span>
              <span className="text-sm font-medium text-green-600">
                +{formatCurrency(budget.totalIncome - budget.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Taux d'épargne:</span>
              <span className="text-sm font-medium">
                {Math.round((budget.savings / budget.totalIncome) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
