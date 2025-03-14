
import React from 'react';
import { Budget } from '@/types/budget';
import DonutChart from '@/components/charts/DonutChart';
import { formatCurrency } from '@/lib/formatters';

interface BudgetDistributionProps {
  budget: Budget;
}

const BudgetDistribution: React.FC<BudgetDistributionProps> = ({ budget }) => {
  // Calculate total for fixed and variable expenses
  const fixedExpenses = budget.expenses
    .filter(expense => expense.type === 'fixed')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const variableExpenses = budget.expenses
    .filter(expense => expense.type === 'variable')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate savings and investment
  const allocatedFunds = fixedExpenses + variableExpenses + budget.savings + budget.investment;
  const unallocated = Math.max(0, budget.totalIncome - allocatedFunds);

  // Prepare data for the donut chart
  const chartData = {
    labels: ['Dépenses fixes', 'Dépenses variables', 'Épargne', 'Investissement', 'Non alloué'],
    values: [
      fixedExpenses,
      variableExpenses,
      budget.savings,
      budget.investment,
      unallocated
    ],
    colors: [
      '#F97316', // Orange for fixed expenses
      '#FB923C', // Lighter orange for variable expenses
      '#22C55E', // Green for savings
      '#0EA5E9', // Blue for investments
      '#E5E7EB', // Gray for unallocated
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
    </div>
  );
};

export default BudgetDistribution;
