
import React, { useState } from 'react';
import { mockBudget } from '@/lib/mockData';
import BudgetOverview from '@/components/budget/BudgetOverview';
import SecurityCushion from '@/components/budget/SecurityCushion';
import BudgetFormModal from '@/components/budget/BudgetFormModal';
import SecurityCushionForm from '@/components/budget/SecurityCushionForm';
import { Budget, Income, Expense } from '@/types/budget';
import { PiggyBank, Download, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const BudgetPage = () => {
  const [budget, setBudget] = useState<Budget>({...mockBudget});
  
  // Security cushion state
  const [currentSavings, setCurrentSavings] = useState(15000);
  const [riskProfile, setRiskProfile] = useState<'high' | 'medium' | 'low'>('medium');
  
  // UI state
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [cushionFormOpen, setCushionFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Income | Expense | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'income' | 'expense'} | null>(null);

  // Calculate security cushion details
  const monthlyExpenses = budget.totalExpenses;
  const recommendedMonths = 
    riskProfile === 'high' ? 3 :
    riskProfile === 'medium' ? 6 : 9;
  const targetAmount = monthlyExpenses * recommendedMonths;

  // Handle adding or editing income
  const handleSaveIncome = (income: Income) => {
    const isEditing = budget.incomes.some(item => item.id === income.id);
    let newIncomes: Income[];
    
    if (isEditing) {
      newIncomes = budget.incomes.map(item => 
        item.id === income.id ? income : item
      );
    } else {
      newIncomes = [...budget.incomes, income];
    }
    
    // Recalculate total income
    const totalIncome = newIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    setBudget({
      ...budget,
      incomes: newIncomes,
      totalIncome
    });
  };

  // Handle adding or editing expense
  const handleSaveExpense = (expense: Expense) => {
    const isEditing = budget.expenses.some(item => item.id === expense.id);
    let newExpenses: Expense[];
    
    if (isEditing) {
      newExpenses = budget.expenses.map(item => 
        item.id === expense.id ? expense : item
      );
    } else {
      newExpenses = [...budget.expenses, expense];
    }
    
    // Recalculate total expenses
    const totalExpenses = newExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    setBudget({
      ...budget,
      expenses: newExpenses,
      totalExpenses
    });
  };

  // Handle deleting an item
  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'income') {
      const newIncomes = budget.incomes.filter(item => item.id !== itemToDelete.id);
      const totalIncome = newIncomes.reduce((sum, inc) => sum + inc.amount, 0);
      
      setBudget({
        ...budget,
        incomes: newIncomes,
        totalIncome
      });
    } else {
      const newExpenses = budget.expenses.filter(item => item.id !== itemToDelete.id);
      const totalExpenses = newExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      setBudget({
        ...budget,
        expenses: newExpenses,
        totalExpenses
      });
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    
    toast({
      title: "Suppression réussie",
      description: "L'élément a été supprimé avec succès.",
    });
  };

  // Handle updating security cushion
  const handleSaveCushion = (data: {currentAmount: number, riskProfile: 'high' | 'medium' | 'low'}) => {
    setCurrentSavings(data.currentAmount);
    setRiskProfile(data.riskProfile);
  };

  // Edit income
  const handleEditIncome = (income: Income) => {
    setItemToEdit(income);
    setIncomeFormOpen(true);
  };

  // Edit expense
  const handleEditExpense = (expense: Expense) => {
    setItemToEdit(expense);
    setExpenseFormOpen(true);
  };

  // Delete confirmation
  const confirmDelete = (id: string, type: 'income' | 'expense') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Budget & Épargne</h1>
          <p className="text-muted-foreground">Gérez vos finances mensuelles</p>
        </div>
        
        <div className="flex gap-3">
          <button className="wealth-btn wealth-btn-secondary flex items-center gap-2">
            <Download size={18} />
            <span>Exporter</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetOverview budget={budget} />
        </div>
        
        <div>
          <SecurityCushion 
            currentAmount={currentSavings}
            targetAmount={targetAmount}
            expenseAmount={monthlyExpenses}
            riskProfile={riskProfile}
          />
          
          <div className="mt-4 text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCushionFormOpen(true)}
            >
              <Edit size={16} className="mr-1" /> Modifier mon matelas
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="wealth-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Revenus</h3>
            <Button 
              onClick={() => {
                setItemToEdit(null);
                setIncomeFormOpen(true);
              }}
              variant="outline" 
              size="sm"
            >
              <Plus size={16} className="mr-1" /> Ajouter
            </Button>
          </div>
          
          <div className="space-y-4">
            {budget.incomes.map((income) => (
              <div key={income.id} className="p-4 rounded-lg border border-border hover:border-wealth-primary/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <PiggyBank size={18} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{income.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {income.frequency === 'monthly' ? 'Mensuel' : 
                         income.frequency === 'yearly' ? 'Annuel' : 
                         income.frequency === 'weekly' ? 'Hebdomadaire' : 'Quotidien'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-green-600">{formatCurrency(income.amount)}</p>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditIncome(income)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Edit size={16} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(income.id, 'income')}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {budget.incomes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun revenu enregistré</p>
                <Button 
                  onClick={() => {
                    setItemToEdit(null);
                    setIncomeFormOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Plus size={16} className="mr-1" /> Ajouter un revenu
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total des revenus</span>
              <span className="font-medium text-green-600">{formatCurrency(budget.totalIncome)}</span>
            </div>
          </div>
        </div>
        
        <div className="wealth-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Dépenses mensuelles</h3>
            <Button 
              onClick={() => {
                setItemToEdit(null);
                setExpenseFormOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              <Plus size={16} className="mr-1" /> Ajouter
            </Button>
          </div>
          
          <div className="space-y-4">
            {budget.expenses.map((expense) => (
              <div key={expense.id} className="p-4 rounded-lg border border-border hover:border-wealth-primary/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Clock size={18} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{expense.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {expense.category}{' '}
                        {expense.essential && (
                          <span className="badge badge-primary text-[10px] ml-1">Essentiel</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-red-600">{formatCurrency(expense.amount)}</p>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditExpense(expense)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Edit size={16} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(expense.id, 'expense')}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {budget.expenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune dépense enregistrée</p>
                <Button 
                  onClick={() => {
                    setItemToEdit(null);
                    setExpenseFormOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Plus size={16} className="mr-1" /> Ajouter une dépense
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total des dépenses</span>
              <span className="font-medium text-red-600">{formatCurrency(budget.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="wealth-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Recommandations personnalisées</h3>
            <p className="text-sm text-muted-foreground">Basées sur votre profil financier actuel</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Épargne et investissement</h4>
            <p className="text-sm text-green-700">
              Avec un revenu mensuel de {formatCurrency(budget.totalIncome)} et des dépenses de {formatCurrency(budget.totalExpenses)}, 
              vous pouvez épargner {formatCurrency(budget.totalIncome - budget.totalExpenses)} chaque mois.
              Nous recommandons d'allouer {formatCurrency(budget.savings)} à l'épargne de sécurité et {' '}
              {formatCurrency(budget.investment)} aux investissements.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Optimisation des dépenses</h4>
            <p className="text-sm text-blue-700">
              Vos dépenses non essentielles représentent {formatCurrency(budget.expenses
                .filter(e => !e.essential)
                .reduce((sum, e) => sum + e.amount, 0))} par mois. 
              Envisagez de réduire les abonnements non utilisés pour économiser davantage.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Objectifs financiers</h4>
            <p className="text-sm text-purple-700">
              Pour atteindre vos objectifs financiers plus rapidement, augmentez vos contributions mensuelles. 
              Avec {formatCurrency(1200)} actuellement dédiés à vos projets,
              vous pourriez accélérer la réalisation de votre objectif prioritaire en réallouant 200€ supplémentaires.
            </p>
          </div>
        </div>
      </div>
      
      {/* Income Form Modal */}
      <BudgetFormModal
        isOpen={incomeFormOpen}
        onClose={() => {
          setIncomeFormOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveIncome}
        type="income"
        editItem={itemToEdit as Income}
      />
      
      {/* Expense Form Modal */}
      <BudgetFormModal
        isOpen={expenseFormOpen}
        onClose={() => {
          setExpenseFormOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveExpense}
        type="expense"
        editItem={itemToEdit as Expense}
      />
      
      {/* Security Cushion Form */}
      <SecurityCushionForm
        isOpen={cushionFormOpen}
        onClose={() => setCushionFormOpen(false)}
        onSave={handleSaveCushion}
        currentAmount={currentSavings}
        riskProfile={riskProfile}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetPage;
