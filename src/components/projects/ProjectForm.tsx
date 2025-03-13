
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FinancialGoal } from '@/types/goals';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<FinancialGoal, 'id'> & { id?: string }) => void;
  editProject?: FinancialGoal;
  monthlySavings: number;
}

const formSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  type: z.enum(['project', 'savings', 'investment']),
  targetAmount: z.coerce.number().min(1, 'Montant cible requis'),
  currentAmount: z.coerce.number().min(0, 'Montant actuel invalide'),
  monthlyContribution: z.coerce.number().min(0, 'Contribution mensuelle invalide'),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.date(),
  targetDate: z.date(),
}).refine((data) => {
  // Vérifier que la date cible est postérieure à la date de début
  return data.targetDate > data.startDate;
}, {
  message: "La date cible doit être postérieure à la date de début",
  path: ["targetDate"]
});

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, editProject, monthlySavings }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Calculer le nombre de mois entre les deux dates
    const startDate = values.startDate;
    const targetDate = values.targetDate;
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

    const project: Omit<FinancialGoal, 'id'> & { id?: string } = {
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

    onSave(project);
    onClose();
  };

  const isBudgetExceeded = form.watch('monthlyContribution') > monthlySavings;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editProject ? 'Modifier le projet' : 'Ajouter un projet'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du projet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Voyage au Japon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du projet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="project">Projet</SelectItem>
                        <SelectItem value="savings">Épargne</SelectItem>
                        <SelectItem value="investment">Investissement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant cible (€)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant actuel (€)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="monthlyContribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution mensuelle (€)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {isBudgetExceeded && (
                    <FormDescription className="text-red-500">
                      Attention: Cette contribution dépasse votre capacité d'épargne mensuelle de {monthlySavings}€
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={2020}
                          toYear={2030}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date cible</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={2020}
                          toYear={2030}
                          disabled={(date) => date < form.watch('startDate')}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
