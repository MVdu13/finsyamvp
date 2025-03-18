
import React, { useState } from 'react';
import { FinancialGoal } from '@/types/goals';
import { formatCurrency } from '@/lib/formatters';
import { BarChart4, Calculator, Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProjectsListProps {
  projects: FinancialGoal[];
  selectedProject: FinancialGoal | null;
  onSelectProject: (project: FinancialGoal) => void;
  onAddProject: () => void;
  onEditProject: (project: FinancialGoal) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onAddProject,
  onEditProject,
  onDeleteProject
}) => {
  
  const getProjectProgress = (project: FinancialGoal) => {
    return Math.min(Math.round((project.currentAmount / project.targetAmount) * 100), 100);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Projets</CardTitle>
        <CardDescription>Liste de tous vos projets et objectifs financiers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BarChart4 className="mx-auto h-10 w-10 mb-3 text-muted-foreground" />
              <p>Aucun projet ajouté</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={onAddProject}>
                <Plus size={16} className="mr-1" /> Ajouter un projet
              </Button>
            </div>
          ) : (
            projects.map((project) => {
              const progress = getProjectProgress(project);
              const isSelected = selectedProject?.id === project.id;
              
              return (
                <div 
                  key={project.id} 
                  className={`p-4 rounded-lg border border-border transition-all cursor-pointer ${isSelected ? 'border-wealth-primary border-2' : 'hover:border-wealth-primary/20'}`}
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${project.type === 'savings' ? 'bg-blue-100' : 
                        project.type === 'investment' ? 'bg-green-100' : 
                        'bg-wealth-primary/10'}
                      `}>
                        <Calculator 
                          size={18} 
                          className={`
                            ${project.type === 'savings' ? 'text-blue-600' : 
                            project.type === 'investment' ? 'text-green-600' : 
                            'text-wealth-primary'}
                          `} 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {project.monthlyContribution > 0 
                            ? `${formatCurrency(project.monthlyContribution)}/mois` 
                            : "Pas de contribution régulière"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {project.timeframe}
                      </span>
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProject(project);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Edit size={16} className="text-gray-500" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Trash2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>{formatCurrency(project.currentAmount)}</span>
                      <span className="text-muted-foreground">{progress}%</span>
                      <span>{formatCurrency(project.targetAmount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          progress >= 100 ? 'bg-green-500' :
                          progress >= 50 ? 'bg-wealth-primary' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsList;
