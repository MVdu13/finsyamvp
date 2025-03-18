
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormValues } from './projectFormSchema';

interface AmountFieldsProps {
  form: UseFormReturn<ProjectFormValues>;
  monthlySavings: number;
}

const AmountFields: React.FC<AmountFieldsProps> = ({ form, monthlySavings }) => {
  const isBudgetExceeded = form.watch('monthlyContribution') > monthlySavings;

  return (
    <>
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
    </>
  );
};

export default AmountFields;
