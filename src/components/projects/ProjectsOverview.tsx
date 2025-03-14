
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { BarChart4 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialGoal } from '@/types/goals';

interface ProjectsOverviewProps {
  projects: FinancialGoal[];
  projectsInProgress: number;
  projectsCompleted: number;
  totalAllocation: number;
}

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  projects,
  projectsInProgress,
  projectsCompleted,
  totalAllocation
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-wealth-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Projets en cours</CardTitle>
          <CardDescription>Projets actifs à financer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{projectsInProgress}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Projets finalisés</CardTitle>
          <CardDescription>Objectifs atteints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{projectsCompleted}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Allocation mensuelle</CardTitle>
          <CardDescription>Total des contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalAllocation)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsOverview;
