
import React from 'react';
import DonutChart from '@/components/charts/DonutChart';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialGoal } from '@/types/goals';

interface SavingsAllocationChartProps {
  savingsTotal: number;
  securityCushionAmount: number;
  projects: FinancialGoal[];
}

const SavingsAllocationChart: React.FC<SavingsAllocationChartProps> = ({
  savingsTotal,
  securityCushionAmount,
  projects
}) => {
  // Get each project with a non-zero amount
  const activeProjects = projects.filter(project => project.currentAmount > 0);
  
  // Calculate the total allocated amount
  const projectsAllocation = activeProjects.reduce((sum, project) => sum + project.currentAmount, 0);
  const allocatedAmount = securityCushionAmount + projectsAllocation;
  const unallocatedAmount = Math.max(0, savingsTotal - allocatedAmount);
  
  // Prepare chart data
  const chartData = {
    labels: [
      'Matelas de sécurité',
      ...activeProjects.map(project => project.name),
      ...(unallocatedAmount > 0 ? ['Non alloué'] : [])
    ],
    values: [
      securityCushionAmount,
      ...activeProjects.map(project => project.currentAmount),
      ...(unallocatedAmount > 0 ? [unallocatedAmount] : [])
    ],
    colors: [
      '#10b981', // green for security cushion
      // Generate different colors for each project
      ...activeProjects.map((_, index) => {
        // Generate different blue shades for projects
        const blueHues = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#60a5fa', '#93c5fd'];
        return blueHues[index % blueHues.length];
      }),
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
