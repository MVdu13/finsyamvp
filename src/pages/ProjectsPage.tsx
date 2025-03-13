import React, { useState, useEffect } from 'react';
import { FinancialGoal, ProjectPlan } from '@/types/goals';
import { mockBudget, mockGoals } from '@/lib/mockData';
import { formatCurrency } from '@/lib/formatters';
import { BarChart4, Calculator, Calendar, Download, Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ProjectForm from '@/components/projects/ProjectForm';
import FundingPlan from '@/components/projects/FundingPlan';
import { toast } from '@/hooks/use-toast';
import { Asset } from '@/types/assets';

interface ProjectsPageProps {
  onAddAsset?: (newAsset: Omit<Asset, 'id'>) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onAddAsset }) => {
  const [projects, setProjects] = useState<FinancialGoal[]>([]);
  const [selectedProject, setSelectedProject] = useState<FinancialGoal | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Monthly savings from budget
  const monthlySavings = mockBudget.totalIncome - mockBudget.totalExpenses;
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load projects from localStorage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem('financial-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects([...mockGoals]);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financial-projects', JSON.stringify(projects));
  }, [projects]);
  
  const handleSelectProject = (project: FinancialGoal) => {
    setSelectedProject(project);
  };
  
  const handleAddProject = () => {
    setSelectedProject(null); // Ensure we're adding, not editing
    setIsFormOpen(true);
  };
  
  const handleEditProject = (project: FinancialGoal) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };
  
  const handleSaveProject = (projectData: Omit<FinancialGoal, 'id'> & { id?: string }) => {
    if (projectData.id) {
      // Update existing project
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === projectData.id ? {...projectData as FinancialGoal} : p)
      );
      toast({
        title: "Projet mis à jour",
        description: "Votre projet a été mis à jour avec succès.",
      });
    } else {
      // Add new project
      const newProject: FinancialGoal = {
        ...projectData,
        id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      toast({
        title: "Projet ajouté",
        description: "Votre nouveau projet a été ajouté avec succès.",
      });
    }
    setIsFormOpen(false);
  };
  
  const handleDeleteProject = () => {
    if (projectToDelete) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete));
      if (selectedProject?.id === projectToDelete) {
        setSelectedProject(null);
      }
      setProjectToDelete(null);
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès.",
      });
    }
    setDeleteDialogOpen(false);
  };
  
  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleSelectPlan = (plan: ProjectPlan) => {
    if (!selectedProject) return;
    
    // Update the project with the selected plan
    const updatedProject: FinancialGoal = {
      ...selectedProject,
      monthlyContribution: plan.monthlyContribution
    };
    
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p)
    );
    
    setSelectedProject(updatedProject);
    
    toast({
      title: "Plan appliqué",
      description: `Le plan de financement sur ${plan.timeToTarget} mois a été appliqué au projet.`,
    });
  };
  
  const totalAllocation = projects.reduce((total, project) => total + project.monthlyContribution, 0);
  const projectsInProgress = projects.filter(p => p.currentAmount < p.targetAmount).length;
  const projectsCompleted = projects.filter(p => p.currentAmount >= p.targetAmount).length;
  
  const getProjectProgress = (project: FinancialGoal) => {
    return Math.min(Math.round((project.currentAmount / project.targetAmount) * 100), 100);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projets financiers</h1>
          <p className="text-muted-foreground">Planifiez et suivez vos projets et objectifs financiers</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} />
            <span>Exporter</span>
          </Button>
          <Button onClick={handleAddProject} className="gap-2">
            <Plus size={18} />
            <span>Nouveau projet</span>
          </Button>
        </div>
      </div>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                    <Button variant="outline" size="sm" className="mt-3" onClick={handleAddProject}>
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
                        onClick={() => handleSelectProject(project)}
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
                                  handleEditProject(project);
                                }}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Edit size={16} className="text-gray-500" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(project.id);
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
        </div>
        
        <div className="space-y-6">
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
                    onSelectPlan={handleSelectPlan}
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
          
          <Card>
            <CardHeader>
              <CardTitle>Capacité d'épargne</CardTitle>
              <CardDescription>Basée sur votre budget mensuel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenus mensuels</span>
                  <span className="font-medium text-green-600">{formatCurrency(mockBudget.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dépenses mensuelles</span>
                  <span className="font-medium text-red-600">{formatCurrency(mockBudget.totalExpenses)}</span>
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
        </div>
      </div>
      
      {/* Project Form */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        editProject={selectedProject || undefined}
        monthlySavings={monthlySavings}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsPage;
