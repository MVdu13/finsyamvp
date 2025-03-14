
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Budget } from '@/types/budget';

interface SavingsCapacityProps {
  budget: Budget;
  totalAllocation: number;
}

const SavingsCapacity: React.FC<SavingsCapacityProps> = ({ budget, totalAllocation }) => {
  const monthlySavings = budget.totalIncome - budget.totalExpenses;
  const remainingSavings = Math.max(0, monthlySavings - totalAllocation);
  const isOverallocated = totalAllocation > monthlySavings;
  
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
            <span className="text-sm text-muted-foreground">Allocation aux projets</span>
            <span className={`font-medium ${isOverallocated ? 'text-red-600' : ''}`}>
              {formatCurrency(totalAllocation)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Disponible pour épargne</span>
            <span className="font-medium text-green-600">{formatCurrency(remainingSavings)}</span>
          </div>
          
          {isOverallocated && (
            <div className="p-3 bg-red-50 rounded-lg mt-2 flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-600">
                Attention : Vos allocations aux projets dépassent votre capacité d'épargne mensuelle. 
                Ajustez vos contributions ou augmentez vos revenus.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsCapacity;
