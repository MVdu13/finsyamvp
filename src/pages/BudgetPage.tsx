import React, { useState } from 'react';
import { mockBudget, mockGoals } from '@/lib/mockData';
import BudgetOverview from '@/components/budget/BudgetOverview';
import BudgetDistribution from '@/components/budget/BudgetDistribution';
import SecurityCushion from '@/components/budget/SecurityCushion';
import BudgetFormModal from '@/components/budget/BudgetFormModal';
import SecurityCushionForm from '@/components/budget/SecurityCushionForm';
import { Budget, Income, Expense } from '@/types/budget';
import { PiggyBank, Download, Clock, Plus, Edit, Trash2, Lock, Shuffle, ArrowUpCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset } from '@/types/assets';
import { mockAssets } from '@/lib/mockData';

const BudgetPage = () => {
  const initialBudget = {
    ...mockBudget,
    expenses: mockBudget.expenses.map(expense => ({
      ...expense,
      type: expense.essential ? 'fixed' : 'variable' as 'fixed' | 'variable'
    }))
  };
  
  const savingsAccountsAssets = mockAssets.filter(
    asset => asset.type === 'savings-account' || asset.type === 'bank-account'
  );
  const savingsAccountsDefaultTotal = savingsAccountsAssets.reduce(
    (sum, asset) => sum + asset.value, 
    0
  );
  
  const [budget, setBudget] = useState<Budget>({...initialBudget});
  
  const [savingsAccountsTotal, setSavingsAccountsTotal] = useState(savingsAccountsDefaultTotal);
  const [riskProfile, setRiskProfile] = useState<'high' | 'medium' | 'low'>('medium');
  
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [cushionFormOpen, setCushionFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Income | Expense | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'income' | 'expense'} | null>(null);
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('fixed');

  const monthlyExpenses = budget.totalExpenses;
  const recommendedMonths = 
    riskProfile === 'high' ? 3 :
    riskProfile === 'medium' ? 6 : 9;
  const targetAmount = monthlyExpenses * recommendedMonths;

  const fixedExpenses = budget.expenses.filter(expense => expense.type === 'fixed');
  const variableExpenses = budget.expenses.filter(expense => expense.type === 'variable');
  
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalVariableExpenses = variableExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const monthlyProjectsContribution = mockGoals.reduce(
    (sum, goal) => sum + goal.monthlyContribution, 
    0
  );

  const availableAfterExpenses = budget.totalIncome - budget.totalExpenses;
  
  const securityCushionGap = Math.max(0, targetAmount - savingsAccountsTotal);
  const needsSecurityCushion = securityCushionGap > 0;
  
  const availableForInvestment = needsSecurityCushion ? 0 : 
    Math.max(0, availableAfterExpenses - monthlyProjectsContribution);

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
    
    const totalIncome = newIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    setBudget({
      ...budget,
      incomes: newIncomes,
      totalIncome
    });
  };

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
    
    const totalExpenses = newExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    setBudget({
      ...budget,
      expenses: newExpenses,
      totalExpenses
    });
  };

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

  const handleSaveCushion = (data: {currentAmount: number, riskProfile: 'high' | 'medium' | 'low'}) => {
    setSavingsAccountsTotal(data.currentAmount);
    setRiskProfile(data.riskProfile);
  };

  const handleEditIncome = (income: Income) => {
    setItemToEdit(income);
    setIncomeFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setItemToEdit(expense);
    setExpenseType(expense.type);
    setExpenseFormOpen(true);
  };

  const confirmDelete = (id: string, type: 'income' | 'expense') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleAddExpense = (type: 'fixed' | 'variable') => {
    setItemToEdit(null);
    setExpenseType(type);
    setExpenseFormOpen(true);
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
      
      <Card className="p-6">
        <CardHeader className="p-0 pb-6">
          <CardTitle>Revenu mensuel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(budget.totalIncome)}</p>
              <p className="text-sm text-muted-foreground">Total des revenus mensuels</p>
            </div>
            <Button 
              onClick={() => {
                setItemToEdit(null);
                setIncomeFormOpen(true);
              }}
              variant="outline" 
              size="sm"
            >
              <Plus size={16} className="mr-1" /> Ajouter un revenu
            </Button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Liste des revenus</h3>
            <div className="space-y-4">
              {budget.incomes.map((income) => (
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
                <div className="text-center py-4 text-muted-foreground">
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
          </div>
          
          <BudgetDistribution 
            budget={budget}
            savingsAccountsTotal={savingsAccountsTotal} 
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="wealth-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Dépenses mensuelles</h3>
              <p className="text-lg font-medium text-red-600">{formatCurrency(budget.totalExpenses)}</p>
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
                    onClick={() => handleAddExpense('fixed')}
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
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-orange-600">{formatCurrency(expense.amount)}</p>
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
                
                {fixedExpenses.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Aucune dépense fixe enregistrée</p>
                    <Button 
                      onClick={() => handleAddExpense('fixed')}
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
                    onClick={() => handleAddExpense('variable')}
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
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
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
                
                {variableExpenses.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Aucune dépense variable enregistrée</p>
                    <Button 
                      onClick={() => handleAddExpense('variable')}
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
        </div>
        
        <div>
          <SecurityCushion 
            currentAmount={savingsAccountsTotal}
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
      
      <div className="wealth-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Recommandations personnalisées</h3>
            <p className="text-sm text-muted-foreground">Basées sur votre profil financier actuel</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span>Analyse financière</span>
            </h4>
            <p className="text-sm text-green-700">
              Vous avez un revenu total de {formatCurrency(budget.totalIncome)}, des dépenses de {formatCurrency(budget.totalExpenses)}, 
              vous pouvez épargner et investir {formatCurrency(availableAfterExpenses)} par mois. 
              En prenant en compte vos projets, vous devez mettre {formatCurrency(monthlyProjectsContribution)} de côté par mois, 
              donc vous pouvez investir seulement {formatCurrency(availableForInvestment)} par mois.
              {needsSecurityCushion && " Attention, vous devez compléter votre matelas de sécurité avant d'investir."}
            </p>
          </div>
        </div>
      </div>
      
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
      
      <BudgetFormModal
        isOpen={expenseFormOpen}
        onClose={() => {
          setExpenseFormOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveExpense}
        type="expense"
        editItem={itemToEdit as Expense}
        expenseType={expenseType}
      />
      
      <SecurityCushionForm
        isOpen={cushionFormOpen}
        onClose={() => setCushionFormOpen(false)}
        onSave={handleSaveCushion}
        currentAmount={savingsAccountsTotal}
        riskProfile={riskProfile}
      />
      
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
