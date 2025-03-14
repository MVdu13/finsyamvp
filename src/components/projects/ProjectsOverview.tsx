
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { BarChart4, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6">
      <Card className="bg-green-50 border border-green-200 mb-5">
        <CardContent className="pt-5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 mb-1">Analyse financière</h4>
              <p className="text-sm text-green-700">
                Vous avez actuellement {projectsInProgress} projet(s) en cours avec une allocation mensuelle totale de {formatCurrency(totalAllocation)}. 
                Cette somme est automatiquement réservée dans votre budget. Veillez à maintenir une épargne de sécurité suffisante avant d'augmenter vos allocations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
    </div>
  );
};

export default ProjectsOverview;
