
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInMonths } from 'date-fns';
import { projectFormSchema, ProjectFormValues } from '../form/projectFormSchema';
import { FinancialGoal } from '@/types/goals';

interface UseProjectFormProps {
  editProject?: FinancialGoal;
}

export const useProjectForm = ({ editProject }: UseProjectFormProps) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: editProject?.name || '',
      description: editProject?.description || '',
      type: editProject?.type || 'project',
      targetAmount: editProject?.targetAmount || 0,
      currentAmount: editProject?.currentAmount || 0,
      monthlyContribution: editProject?.monthlyContribution || 0,
      priority: editProject?.priority || 'medium',
      startDate: editProject ? new Date(editProject.startDate) : new Date(),
      targetDate: editProject ? new Date(editProject.targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }
  });

  // Calculer la contribution mensuelle suggérée lorsque les montants ou dates changent
  useEffect(() => {
    const targetAmount = form.watch('targetAmount');
    const currentAmount = form.watch('currentAmount');
    const startDate = form.watch('startDate');
    const targetDate = form.watch('targetDate');

    if (startDate && targetDate && targetAmount > 0 && targetDate > startDate) {
      // Calculer le nombre de mois entre les deux dates
      const months = Math.max(1, differenceInMonths(targetDate, startDate));
      
      // Calculer la contribution mensuelle suggérée
      const remainingAmount = targetAmount - currentAmount;
      if (remainingAmount > 0) {
        const suggestedContribution = Math.ceil(remainingAmount / months);
        
        // Mettre à jour le champ (sans déclencher de validation)
        form.setValue('monthlyContribution', suggestedContribution, { shouldValidate: false });
      }
    }
  }, [
    form.watch('targetAmount'), 
    form.watch('currentAmount'), 
    form.watch('startDate'), 
    form.watch('targetDate')
  ]);

  const createTimeframe = (startDate: Date, targetDate: Date): string => {
    const diffMonths = Math.max(1, differenceInMonths(targetDate, startDate));
    const diffYears = Math.floor(diffMonths / 12);
    
    let timeframe = '';
    if (diffYears > 0) {
      timeframe = `${diffYears} an${diffYears > 1 ? 's' : ''}`;
      const remainingMonths = diffMonths % 12;
      if (remainingMonths > 0) {
        timeframe += ` ${remainingMonths} mois`;
      }
    } else {
      timeframe = `${diffMonths} mois`;
    }
    
    return timeframe;
  };

  const handleFormSubmit = (values: ProjectFormValues): Omit<FinancialGoal, 'id'> & { id?: string } => {
    const timeframe = createTimeframe(values.startDate, values.targetDate);

    return {
      id: editProject?.id,
      name: values.name,
      description: values.description,
      type: values.type,
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount,
      monthlyContribution: values.monthlyContribution,
      startDate: values.startDate.toISOString(),
      targetDate: values.targetDate.toISOString(),
      priority: values.priority,
      timeframe,
    };
  };

  return {
    form,
    handleFormSubmit
  };
};
