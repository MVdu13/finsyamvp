
import React, { useState, useEffect } from 'react';
import { FinancialGoal, ProjectPlan } from '@/types/goals';
import { mockBudget, mockGoals } from '@/lib/mockData';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectForm from '@/components/projects/ProjectForm';
import { toast } from '@/hooks/use-toast';
import { Asset } from '@/types/assets';
import ProjectsOverview from '@/components/projects/ProjectsOverview';
import ProjectsList from '@/components/projects/ProjectsList';
import ProjectDetails from '@/components/projects/ProjectDetails';
import SavingsCapacity from '@/components/projects/SavingsCapacity';
import ProjectDeleteDialog from '@/components/projects/ProjectDeleteDialog';

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
      
      <ProjectsOverview 
        projects={projects}
        projectsInProgress={projectsInProgress}
        projectsCompleted={projectsCompleted}
        totalAllocation={totalAllocation}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsList 
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={confirmDelete}
          />
        </div>
        
        <div className="space-y-6">
          <ProjectDetails 
            selectedProject={selectedProject}
            monthlySavings={monthlySavings}
            onSelectPlan={handleSelectPlan}
          />
          
          <SavingsCapacity 
            budget={mockBudget}
            totalAllocation={totalAllocation}
          />
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
      <ProjectDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteProject}
      />
    </div>
  );
};

export default ProjectsPage;
