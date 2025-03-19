
import React, { useState, useEffect } from 'react';
import { mockBudget, mockAssets } from '@/lib/mockData';
import BudgetHeader from '@/components/budget/BudgetHeader';
import IncomeSection from '@/components/budget/IncomeSection';
import ExpenseSection from '@/components/budget/ExpenseSection';
import BudgetFormModal from '@/components/budget/BudgetFormModal';
import SecurityCushionForm from '@/components/budget/SecurityCushionForm';
import DeleteConfirmationDialog from '@/components/budget/DeleteConfirmationDialog';
import KeyMetrics from '@/components/budget/KeyMetrics';
import CashflowChart from '@/components/budget/CashflowChart';
import SecurityCushion from '@/components/budget/SecurityCushion';
import { Budget, Income, Expense } from '@/types/budget';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset } from '@/types/assets';
import { FinancialGoal } from '@/types/goals';

const BudgetPage = () => {
  const initialBudget = {
    ...mockBudget,
    expenses: mockBudget.expenses.map(expense => ({
      ...expense,
      type: expense.essential ? 'fixed' : 'variable' as 'fixed' | 'variable'
    }))
  };
  
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  
  const calculateSavingsTotal = () => {
    return assets
      .filter(asset => asset.type === 'savings-account')
      .reduce((sum, asset) => sum + asset.value, 0);
  };
  
  const [budget, setBudget] = useState<Budget>({...initialBudget});
  const [projects, setProjects] = useState<FinancialGoal[]>([]);
  
  useEffect(() => {
    const loadAssetsFromStorage = () => {
      const storedAssets = localStorage.getItem('financial-assets');
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    };
    
    const savedProjects = localStorage.getItem('financial-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    
    loadAssetsFromStorage();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'financial-assets') {
        loadAssetsFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const intervalId = setInterval(() => {
      loadAssetsFromStorage();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);
  
  const savingsAccountsTotal = calculateSavingsTotal();
  const [riskProfile, setRiskProfile] = useState<'high' | 'medium' | 'low'>('medium');
  
  useEffect(() => {
    const savedRiskProfile = localStorage.getItem('security-cushion-risk-profile');
    if (savedRiskProfile && (savedRiskProfile === 'high' || savedRiskProfile === 'medium' || savedRiskProfile === 'low')) {
      setRiskProfile(savedRiskProfile as 'high' | 'medium' | 'low');
    }
  }, []);
  
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
  
  const monthlyProjectsContribution = projects.reduce(
    (sum, goal) => sum + goal.monthlyContribution, 
    0
  );

  const availableAfterExpenses = budget.totalIncome - budget.totalExpenses;
  
  const securityCushionGap = Math.max(0, targetAmount - savingsAccountsTotal);
  const needsSecurityCushion = securityCushionGap > 0;
  
  const availableForInvestment = needsSecurityCushion ? 0 : 
    Math.max(0, availableAfterExpenses - monthlyProjectsContribution);

  const savingsRate = budget.totalIncome > 0 
    ? Math.round((availableAfterExpenses / budget.totalIncome) * 100) 
    : 0;

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
    setRiskProfile(data.riskProfile);
    
    localStorage.setItem('security-cushion-risk-profile', data.riskProfile);
    
    toast({
      title: "Profil de risque mis à jour",
      description: "Votre profil de risque pour le matelas de sécurité a été mis à jour avec succès.",
    });
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
      <BudgetHeader />
      
      <KeyMetrics 
        totalIncome={budget.totalIncome}
        totalExpenses={budget.totalExpenses}
        savingsAmount={availableAfterExpenses}
        monthlyProjectsContribution={monthlyProjectsContribution}
      />
      
      <CashflowChart 
        incomes={budget.incomes}
        expenses={budget.expenses}
        totalIncome={budget.totalIncome}
        totalExpenses={budget.totalExpenses}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <CardHeader className="p-0 pb-6">
            <CardTitle>Revenu mensuel</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <IncomeSection 
              incomes={budget.incomes}
              totalIncome={budget.totalIncome}
              onAddIncome={() => {
                setItemToEdit(null);
                setIncomeFormOpen(true);
              }}
              onEditIncome={handleEditIncome}
              onDeleteIncome={(id) => confirmDelete(id, 'income')}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:row-span-2">
          <SecurityCushion 
            currentAmount={savingsAccountsTotal}
            targetAmount={targetAmount}
            expenseAmount={monthlyExpenses}
            riskProfile={riskProfile}
            onEditClick={() => setCushionFormOpen(true)}
          />
        </Card>
        
        <Card className="p-0 lg:col-span-2">
          <ExpenseSection 
            fixedExpenses={fixedExpenses}
            variableExpenses={variableExpenses}
            totalFixedExpenses={totalFixedExpenses}
            totalVariableExpenses={totalVariableExpenses}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={(id) => confirmDelete(id, 'expense')}
          />
        </Card>
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
      
      <DeleteConfirmationDialog 
        isOpen={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BudgetPage;
