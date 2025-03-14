
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Budget } from '@/types/budget';

interface SavingsCapacityProps {
  budget: Budget;
  totalAllocation: number;
}

const SavingsCapacity: React.FC<SavingsCapacityProps> = ({ budget, totalAllocation }) => {
  const monthlySavings = budget.totalIncome - budget.totalExpenses;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacité d'épargne</CardTitle>
        <CardDescription>Basée sur votre budget mensuel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Revenus mensuels</span>
            <span className="font-medium text-green-600">{formatCurrency(budget.totalIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Dépenses mensuelles</span>
            <span className="font-medium text-red-600">{formatCurrency(budget.totalExpenses)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <span className="font-medium">Capacité d'épargne mensuelle</span>
            <span className="font-bold text-wealth-primary">{formatCurrency(monthlySavings)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Allocation actuelle</span>
            <span className={`font-medium ${totalAllocation > monthlySavings ? 'text-red-600' : ''}`}>
              {formatCurrency(totalAllocation)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Disponible</span>
            <span className="font-medium text-green-600">{formatCurrency(Math.max(0, monthlySavings - totalAllocation))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsCapacity;
