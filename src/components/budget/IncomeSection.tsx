
import React from 'react';
import { Income } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowUpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface IncomeSectionProps {
  incomes: Income[];
  totalIncome: number;
  onAddIncome: () => void;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
}

const IncomeSection: React.FC<IncomeSectionProps> = ({
  incomes,
  totalIncome,
  onAddIncome,
  onEditIncome,
  onDeleteIncome
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
          <p className="text-sm text-muted-foreground">Total des revenus mensuels</p>
        </div>
        <Button 
          onClick={onAddIncome}
          variant="outline" 
          size="sm"
        >
          <Plus size={16} className="mr-1" /> Ajouter un revenu
        </Button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Liste des revenus</h3>
        <div className="space-y-4">
          {incomes.map((income) => (
            <div key={income.id} className="p-4 rounded-lg border border-border hover:border-wealth-primary/20 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowUpCircle size={18} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{income.name}</h4>
                    <p className="text-xs text-muted-foreground">Revenu {
                      income.frequency === 'monthly' ? 'mensuel' :
                      income.frequency === 'yearly' ? 'annuel' :
                      income.frequency === 'weekly' ? 'hebdomadaire' : 'quotidien'
                    }</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-green-600">{formatCurrency(income.amount)}</p>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEditIncome(income)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={16} className="text-gray-500" />
                    </button>
                    <button 
                      onClick={() => onDeleteIncome(income.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {incomes.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>Aucun revenu enregistré</p>
              <Button 
                onClick={onAddIncome}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus size={16} className="mr-1" /> Ajouter un revenu
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IncomeSection;
