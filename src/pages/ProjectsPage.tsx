import React, { useState, useEffect } from 'react';
import { FinancialGoal, ProjectPlan } from '@/types/goals';
import { mockBudget, mockAssets, mockGoals } from '@/lib/mockData';
import { Plus, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectForm from '@/components/projects/ProjectForm';
import { toast } from '@/hooks/use-toast';
import { Asset } from '@/types/assets';
import ProjectsOverview from '@/components/projects/ProjectsOverview';
import ProjectsList from '@/components/projects/ProjectsList';
import ProjectDeleteDialog from '@/components/projects/ProjectDeleteDialog';
import SecurityCushion from '@/components/budget/SecurityCushion';
import SecurityCushionForm from '@/components/budget/SecurityCushionForm';
import SavingsAllocationChart from '@/components/projects/SavingsAllocationChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface ProjectsPageProps {
  onAddAsset?: (newAsset: Omit<Asset, 'id'>) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onAddAsset }) => {
  const [projects, setProjects] = useState<FinancialGoal[]>([]);
  const [selectedProject, setSelectedProject] = useState<FinancialGoal | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [riskProfile, setRiskProfile] = useState<'high' | 'medium' | 'low'>('medium');
  const [cushionFormOpen, setCushionFormOpen] = useState(false);
  
  const monthlySavings = mockBudget.totalIncome - mockBudget.totalExpenses;
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const calculateSavingsTotal = () => {
    return assets
      .filter(asset => asset.type === 'savings-account')
      .reduce((sum, asset) => sum + asset.value, 0);
  };

  const savingsAccountsTotal = calculateSavingsTotal();
  
  const monthlyExpenses = mockBudget.totalExpenses;
  const recommendedMonths = 
    riskProfile === 'high' ? 3 :
    riskProfile === 'medium' ? 6 : 9;
  const targetAmount = monthlyExpenses * recommendedMonths;

  useEffect(() => {
    const savedProjects = localStorage.getItem('financial-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects([...mockGoals]);
    }
    
    const loadAssetsFromStorage = () => {
      const storedAssets = localStorage.getItem('financial-assets');
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    };
    
    loadAssetsFromStorage();
    
    const savedRiskProfile = localStorage.getItem('security-cushion-risk-profile');
    if (savedRiskProfile && (savedRiskProfile === 'high' || savedRiskProfile === 'medium' || savedRiskProfile === 'low')) {
      setRiskProfile(savedRiskProfile as 'high' | 'medium' | 'low');
    }
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'financial-assets') {
        loadAssetsFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('financial-projects', JSON.stringify(projects));
  }, [projects]);
  
  const handleSelectProject = (project: FinancialGoal) => {
    setSelectedProject(project);
  };
  
  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };
  
  const handleEditProject = (project: FinancialGoal) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };
  
  const handleSaveProject = (projectData: Omit<FinancialGoal, 'id'> & { id?: string }) => {
    if (projectData.id) {
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === projectData.id ? {...projectData as FinancialGoal} : p)
      );
      toast({
        title: "Projet mis à jour",
        description: "Votre projet a été mis à jour avec succès.",
      });
    } else {
      const newProject: FinancialGoal = {
        ...projectData,
        id: Math.random().toString(36).substr(2, 9),
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
  
  const handleSaveCushion = (data: {currentAmount: number, riskProfile: 'high' | 'medium' | 'low'}) => {
    setRiskProfile(data.riskProfile);
    
    localStorage.setItem('security-cushion-risk-profile', data.riskProfile);
    
    toast({
      title: "Profil de risque mis à jour",
      description: "Votre profil de risque pour le matelas de sécurité a été mis à jour avec succès.",
    });
  };
  
  const totalAllocation = projects.reduce((total, project) => total + project.monthlyContribution, 0);
  const projectsInProgress = projects.filter(p => p.currentAmount < p.targetAmount).length;
  const projectsCompleted = projects.filter(p => p.currentAmount >= p.targetAmount).length;
  
  const projectsAllocation = projects.reduce((total, project) => total + project.currentAmount, 0);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projets financiers</h1>
          <p className="text-muted-foreground">Planifiez et suivez vos projets et objectifs financiers</p>
        </div>
        
        <div>
          <Button onClick={handleAddProject} className="gap-2">
            <Plus size={18} />
            <span>Nouveau projet</span>
          </Button>
        </div>
      </div>
      
      <ProjectsOverview 
        projects={projects}
        projectsInProgress={projectsInProgress}
        projectsCompleted={projectsCompleted}
        totalAllocation={totalAllocation}
      />
      
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-wealth-primary" />
            <CardTitle>Épargne</CardTitle>
          </div>
          <CardDescription>Vue d'ensemble de votre épargne et de vos objectifs financiers</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <SavingsAllocationChart 
                savingsTotal={savingsAccountsTotal}
                securityCushionAmount={Math.min(savingsAccountsTotal, targetAmount)}
                projects={projects}
              />
            </div>
            
            <div className="lg:col-span-2">
              <SecurityCushion 
                currentAmount={savingsAccountsTotal}
                targetAmount={targetAmount}
                expenseAmount={monthlyExpenses}
                riskProfile={riskProfile}
                onEditClick={() => setCushionFormOpen(true)}
              />
            </div>
          </div>
          
          <ProjectsList 
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={confirmDelete}
          />
        </CardContent>
      </Card>
      
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        editProject={selectedProject || undefined}
        monthlySavings={monthlySavings}
      />
      
      <ProjectDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteProject}
      />
      
      <SecurityCushionForm
        isOpen={cushionFormOpen}
        onClose={() => setCushionFormOpen(false)}
        onSave={handleSaveCushion}
        currentAmount={savingsAccountsTotal}
        riskProfile={riskProfile}
      />
    </div>
  );
};

export default ProjectsPage;
