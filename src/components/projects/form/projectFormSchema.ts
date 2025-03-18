
import { z } from 'zod';

export const projectFormSchema = z.object({
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

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
