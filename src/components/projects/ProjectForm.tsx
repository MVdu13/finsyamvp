
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FinancialGoal } from '@/types/goals';
import { useProjectForm } from './hooks/useProjectForm';
import BasicInfoFields from './form/BasicInfoFields';
import TypeAndPriorityFields from './form/TypeAndPriorityFields';
import AmountFields from './form/AmountFields';
import DateFields from './form/DateFields';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<FinancialGoal, 'id'> & { id?: string }) => void;
  editProject?: FinancialGoal;
  monthlySavings: number;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editProject,
  monthlySavings
}) => {
  const { form, handleFormSubmit, resetForm } = useProjectForm({ editProject });

  // Reset form when dialog opens or when editProject changes
  useEffect(() => {
    if (isOpen) {
      resetForm(editProject);
    }
  }, [isOpen, editProject, resetForm]);

  const onSubmit = form.handleSubmit((values) => {
    const project = handleFormSubmit(values);
    onSave(project);
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <BasicInfoFields form={form} />
            <TypeAndPriorityFields form={form} />
            <AmountFields form={form} monthlySavings={monthlySavings} />
            <DateFields form={form} />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {editProject ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
