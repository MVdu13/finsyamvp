
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Income, Expense } from '@/types/budget';
import { toast } from "@/hooks/use-toast";
import { PiggyBank, ShoppingCart } from 'lucide-react';

type BudgetItemType = 'income' | 'expense';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Income | Expense) => void;
  type: BudgetItemType;
  editItem?: Income | Expense;
  expenseType?: 'fixed' | 'variable';
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  editItem,
  expenseType: initialExpenseType
}) => {
  // State for form fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly' | 'daily'>('monthly');
  const [category, setCategory] = useState('Autres');
  const [essential, setEssential] = useState(false);
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('fixed');

  // Reset form when closed or when switching between add/edit
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // Pre-fill the form when editing
        setName(editItem.name);
        setAmount(editItem.amount.toString());
        setFrequency(editItem.frequency);
        
        if (type === 'expense') {
          const expenseItem = editItem as Expense;
          setCategory(expenseItem.category);
          setEssential(expenseItem.essential);
          setExpenseType(expenseItem.type);
        }
      } else {
        // Clear form when adding new
        setName('');
        setAmount('');
        setFrequency('monthly');
        setCategory('Autres');
        setEssential(false);
        setExpenseType(initialExpenseType || 'fixed');
      }
    }
  }, [isOpen, editItem, type, initialExpenseType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        toast({
          title: "Montant invalide",
          description: "Le montant doit être un nombre positif.",
          variant: "destructive",
        });
        return;
      }

      if (type === 'income') {
        const incomeItem: Income = {
          id: editItem ? editItem.id : Date.now().toString(),
          name,
          amount: numAmount,
          frequency,
          icon: 'default'
        };
        onSave(incomeItem);
      } else {
        const expenseItem: Expense = {
          id: editItem ? editItem.id : Date.now().toString(),
          name,
          amount: numAmount,
          category,
          frequency,
          essential,
          type: expenseType
        };
        onSave(expenseItem);
      }

      onClose();
      toast({
        title: `${editItem ? 'Modification' : 'Ajout'} réussi`,
        description: `L'élément a été ${editItem ? 'modifié' : 'ajouté'} avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'income' ? (
              <>
                <PiggyBank className="h-5 w-5 text-green-500" />
                <span>{editItem ? 'Modifier un revenu' : 'Ajouter un revenu'}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 text-red-500" />
                <span>{editItem ? 'Modifier une dépense' : 'Ajouter une dépense'}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === 'income' 
              ? 'Renseignez les détails de votre revenu.' 
              : 'Renseignez les détails de votre dépense.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'income' ? 'Ex: Salaire' : 'Ex: Loyer'}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 1000"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Fréquence</Label>
            <Select 
              value={frequency} 
              onValueChange={(value) => setFrequency(value as any)}
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Sélectionner une fréquence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="yearly">Annuel</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="daily">Quotidien</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {type === 'expense' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Logement">Logement</SelectItem>
                    <SelectItem value="Alimentation">Alimentation</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Santé">Santé</SelectItem>
                    <SelectItem value="Loisirs">Loisirs</SelectItem>
                    <SelectItem value="Abonnements">Abonnements</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Éducation">Éducation</SelectItem>
                    <SelectItem value="Divers">Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="essential" 
                  checked={essential} 
                  onCheckedChange={setEssential}
                />
                <Label htmlFor="essential">Dépense essentielle</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expenseType">Type de dépense</Label>
                <Select 
                  value={expenseType} 
                  onValueChange={(value) => setExpenseType(value as 'fixed' | 'variable')}
                >
                  <SelectTrigger id="expenseType">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixe</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetFormModal;
