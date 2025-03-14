
import React from 'react';
import { Budget } from '@/types/budget';
import DonutChart from '@/components/charts/DonutChart';
import { formatCurrency } from '@/lib/formatters';
import { mockGoals } from '@/lib/mockData';

interface BudgetDistributionProps {
  budget: Budget;
  savingsAccountsTotal?: number;
}

const BudgetDistribution: React.FC<BudgetDistributionProps> = ({ 
  budget, 
  savingsAccountsTotal = 15000 // Default value if not provided
}) => {
  // Calculate total for fixed and variable expenses
  const fixedExpenses = budget.expenses
    .filter(expense => expense.type === 'fixed')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const variableExpenses = budget.expenses
    .filter(expense => expense.type === 'variable')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total monthly contribution for projects
  const monthlyProjectsContribution = mockGoals.reduce(
    (sum, goal) => sum + goal.monthlyContribution, 
    0
  );
  
  // Calculate total expenses (fixed + variable)
  const totalExpenses = fixedExpenses + variableExpenses;
  
  // Calculate available after expenses
  const availableAfterExpenses = Math.max(0, budget.totalIncome - totalExpenses);
  
  // Calculate security cushion gap
  // Target is 6 months of total expenses by default
  const securityCushionTarget = totalExpenses * 6;
  const securityCushionGap = Math.max(0, securityCushionTarget - savingsAccountsTotal);
  
  // Calculate allocations based on priorities:
  // 1. If security cushion is not met, allocate to security cushion
  // 2. If security cushion is met, allocate to projects
  // 3. Remaining goes to investments
  
  let securityCushionAllocation = 0;
  let projectsAllocation = 0;
  let investmentAllocation = 0;
  
  // If security cushion is not met, prioritize it
  if (securityCushionGap > 0) {
    securityCushionAllocation = Math.min(availableAfterExpenses, securityCushionGap);
    investmentAllocation = Math.max(0, availableAfterExpenses - securityCushionAllocation);
  } else {
    // Security cushion is met, allocate to projects
    projectsAllocation = Math.min(availableAfterExpenses, monthlyProjectsContribution);
    investmentAllocation = Math.max(0, availableAfterExpenses - projectsAllocation);
  }
  
  // Prepare data for the donut chart
  const chartData = {
    labels: ['Dépenses fixes', 'Dépenses variables', 'Épargne de sécurité', 'Projets', 'Investissement'],
    values: [
      fixedExpenses,
      variableExpenses,
      securityCushionAllocation,
      projectsAllocation,
      investmentAllocation
    ],
    colors: [
      '#F97316', // Orange for fixed expenses
      '#FB923C', // Lighter orange for variable expenses
      '#22C55E', // Green for security cushion
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
