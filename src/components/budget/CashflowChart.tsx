
import React from 'react';
import { Income, Expense } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface CashflowChartProps {
  incomes: Income[];
  expenses: Expense[];
  totalIncome: number;
  totalExpenses: number;
}

const CashflowChart: React.FC<CashflowChartProps> = ({
  incomes,
  expenses,
  totalIncome,
  totalExpenses
}) => {
  // Calculer la hauteur des barres en fonction du montant maximum
  const maxAmount = Math.max(totalIncome, totalExpenses);
  const getHeightPercentage = (amount: number) => {
    return Math.max(10, (amount / maxAmount) * 100);
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Flux de trésorerie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-8 h-80">
          {/* Colonne des revenus */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-center mb-3 gap-2">
              <ArrowUp className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Revenus</h3>
            </div>
            <div className="flex-1 flex items-end justify-center relative">
              <div 
                className="w-40 bg-green-500/20 border-t-4 border-green-500 rounded-t-md"
                style={{ height: `${getHeightPercentage(totalIncome)}%` }}
              >
                <div className="absolute -top-8 left-0 right-0 text-center font-medium">
                  {formatCurrency(totalIncome)}
                </div>
                <div className="p-4 h-full overflow-y-auto">
                  {incomes.map(income => (
                    <div key={income.id} className="flex justify-between text-sm mb-2 border-b border-green-200 pb-1">
                      <span>{income.name}</span>
                      <span className="font-medium">{formatCurrency(income.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne des dépenses */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-center mb-3 gap-2">
              <ArrowDown className="h-5 w-5 text-red-500" />
              <h3 className="font-medium">Dépenses</h3>
            </div>
            <div className="flex-1 flex items-end justify-center relative">
              <div 
                className="w-40 bg-red-500/20 border-t-4 border-red-500 rounded-t-md"
                style={{ height: `${getHeightPercentage(totalExpenses)}%` }}
              >
                <div className="absolute -top-8 left-0 right-0 text-center font-medium">
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="p-4 h-full overflow-y-auto">
                  {expenses.map(expense => (
                    <div key={expense.id} className="flex justify-between text-sm mb-2 border-b border-red-200 pb-1">
                      <span>{expense.name}</span>
                      <span className="font-medium">{formatCurrency(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashflowChart;
