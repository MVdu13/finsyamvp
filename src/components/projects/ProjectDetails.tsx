
import React from 'react';
import { FinancialGoal, ProjectPlan } from '@/types/goals';
import { formatCurrency } from '@/lib/formatters';
import { BarChart4, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FundingPlan from '@/components/projects/FundingPlan';

interface ProjectDetailsProps {
  selectedProject: FinancialGoal | null;
  monthlySavings: number;
  onSelectPlan: (plan: ProjectPlan) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  selectedProject,
  monthlySavings,
  onSelectPlan
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planification</CardTitle>
        <CardDescription>Analyse et recommandations</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedProject ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-lg">{selectedProject.name}</h3>
              {selectedProject.description && (
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              )}
            </div>
            
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Montant cible</span>
                <span className="font-medium">{formatCurrency(selectedProject.targetAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Montant actuel</span>
                <span className="font-medium">{formatCurrency(selectedProject.currentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contribution mensuelle</span>
                <span className={`font-medium ${selectedProject.monthlyContribution > monthlySavings ? 'text-red-600' : ''}`}>
                  {formatCurrency(selectedProject.monthlyContribution)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Priorité</span>
                <span className="font-medium capitalize">{selectedProject.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Échéance</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  {selectedProject.timeframe}
                </span>
              </div>
            </div>
            
            <FundingPlan
              targetAmount={selectedProject.targetAmount}
              currentAmount={selectedProject.currentAmount}
              monthlySavings={monthlySavings}
              onSelectPlan={onSelectPlan}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart4 className="mx-auto h-10 w-10 mb-3" />
            <p>Sélectionnez un projet pour voir les détails et recommandations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
