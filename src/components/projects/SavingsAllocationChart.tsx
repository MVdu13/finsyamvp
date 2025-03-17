
import React from 'react';
import DonutChart from '@/components/charts/DonutChart';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SavingsAllocationChartProps {
  savingsTotal: number;
  securityCushionAmount: number;
  projectsAllocation: number;
}

const SavingsAllocationChart: React.FC<SavingsAllocationChartProps> = ({
  savingsTotal,
  securityCushionAmount,
  projectsAllocation
}) => {
  // Calculate the unallocated amount (if any)
  const allocatedAmount = securityCushionAmount + projectsAllocation;
  const unallocatedAmount = Math.max(0, savingsTotal - allocatedAmount);
  
  const chartData = {
    labels: [
      'Matelas de sécurité',
      'Projets financiers',
      ...(unallocatedAmount > 0 ? ['Non alloué'] : [])
    ],
    values: [
      securityCushionAmount,
      projectsAllocation,
      ...(unallocatedAmount > 0 ? [unallocatedAmount] : [])
    ],
    colors: [
      '#10b981', // green for security cushion
      '#3b82f6', // blue for projects
      ...(unallocatedAmount > 0 ? ['#d1d5db'] : []) // gray for unallocated
    ]
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Allocation de l'épargne</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <DonutChart data={chartData} height={220} />
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Total alloué</p>
            <p className="font-medium">{formatCurrency(allocatedAmount)}</p>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Reste disponible</p>
            <p className="font-medium">{formatCurrency(unallocatedAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsAllocationChart;
