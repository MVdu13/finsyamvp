
import React from 'react';
import { Expense } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Lock, Shuffle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ExpenseSectionProps {
  fixedExpenses: Expense[];
  variableExpenses: Expense[];
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  onAddExpense: (type: 'fixed' | 'variable') => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  fixedExpenses,
  variableExpenses,
  totalFixedExpenses,
  totalVariableExpenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}) => {
  return (
    <div className="wealth-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Dépenses mensuelles</h3>
        <p className="text-lg font-medium text-red-600">
          {formatCurrency(totalFixedExpenses + totalVariableExpenses)}
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-orange-600" />
            <h4 className="font-medium">Dépenses fixes</h4>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-orange-600">{formatCurrency(totalFixedExpenses)}</p>
            <Button 
              onClick={() => onAddExpense('fixed')}
              variant="outline" 
              size="sm"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {fixedExpenses.map((expense) => (
            <div key={expense.id} className="p-4 rounded-lg border border-border hover:border-wealth-primary/20 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Lock size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{expense.name}</h4>
                    <p className="text-xs text-muted-foreground">{expense.category} ({
                      expense.frequency === 'monthly' ? 'mensuel' :
                      expense.frequency === 'yearly' ? 'annuel' :
                      expense.frequency === 'weekly' ? 'hebdomadaire' : 'quotidien'
                    })</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-orange-600">{formatCurrency(expense.amount)}</p>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEditExpense(expense)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={16} className="text-gray-500" />
                    </button>
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {fixedExpenses.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>Aucune dépense fixe enregistrée</p>
              <Button 
                onClick={() => onAddExpense('fixed')}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus size={16} className="mr-1" /> Ajouter une dépense fixe
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Shuffle size={18} className="text-red-600" />
            <h4 className="font-medium">Dépenses variables</h4>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-red-600">{formatCurrency(totalVariableExpenses)}</p>
            <Button 
              onClick={() => onAddExpense('variable')}
              variant="outline" 
              size="sm"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {variableExpenses.map((expense) => (
            <div key={expense.id} className="p-4 rounded-lg border border-border hover:border-wealth-primary/20 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Shuffle size={18} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{expense.name}</h4>
                    <p className="text-xs text-muted-foreground">{expense.category} ({
                      expense.frequency === 'monthly' ? 'mensuel' :
                      expense.frequency === 'yearly' ? 'annuel' :
                      expense.frequency === 'weekly' ? 'hebdomadaire' : 'quotidien'
                    })</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-red-600">{formatCurrency(expense.amount)}</p>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEditExpense(expense)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={16} className="text-gray-500" />
                    </button>
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {variableExpenses.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>Aucune dépense variable enregistrée</p>
              <Button 
                onClick={() => onAddExpense('variable')}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus size={16} className="mr-1" /> Ajouter une dépense variable
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSection;
