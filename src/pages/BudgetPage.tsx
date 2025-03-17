
import React, { useState, useEffect } from 'react';
import { mockBudget, mockAssets } from '@/lib/mockData';
import BudgetHeader from '@/components/budget/BudgetHeader';
import IncomeSection from '@/components/budget/IncomeSection';
import ExpenseSection from '@/components/budget/ExpenseSection';
import SecurityCushion from '@/components/budget/SecurityCushion';
import BudgetFormModal from '@/components/budget/BudgetFormModal';
import SecurityCushionForm from '@/components/budget/SecurityCushionForm';
import FinancialRecommendations from '@/components/budget/FinancialRecommendations';
import DeleteConfirmationDialog from '@/components/budget/DeleteConfirmationDialog';
import KeyMetrics from '@/components/budget/KeyMetrics';
import CashflowChart from '@/components/budget/CashflowChart';
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
  
  // Get all assets for calculations
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  
  // Calculate the total of savings accounts
  const calculateSavingsTotal = () => {
    return assets
      .filter(asset => asset.type === 'savings-account')
      .reduce((sum, asset) => sum + asset.value, 0);
  };
  
  const [budget, setBudget] = useState<Budget>({...initialBudget});
  const [projects, setProjects] = useState<FinancialGoal[]>([]);
  
  // Load projects and assets from localStorage and listen for changes
  useEffect(() => {
    // Function to load assets from localStorage
    const loadAssetsFromStorage = () => {
      const storedAssets = localStorage.getItem('financial-assets');
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    };
    
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('financial-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    
    // Initial load of assets
    loadAssetsFromStorage();
    
    // Listen for storage events to update assets when they change in other pages
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'financial-assets') {
        loadAssetsFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check every second for changes in localStorage
    const intervalId = setInterval(() => {
      loadAssetsFromStorage();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);
  
  // Current savings accounts total
  const savingsAccountsTotal = calculateSavingsTotal();
  const [riskProfile, setRiskProfile] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Load risk profile from localStorage on mount
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
  
  // Calculate monthly project contribution from localStorage projects
  const monthlyProjectsContribution = projects.reduce(
    (sum, goal) => sum + goal.monthlyContribution, 
    0
  );

  const availableAfterExpenses = budget.totalIncome - budget.totalExpenses;
  
  const securityCushionGap = Math.max(0, targetAmount - savingsAccountsTotal);
  const needsSecurityCushion = securityCushionGap > 0;
  
  const availableForInvestment = needsSecurityCushion ? 0 : 
    Math.max(0, availableAfterExpenses - monthlyProjectsContribution);

  // Calculate savings rate
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
    // We only update the risk profile, as the current amount is now calculated dynamically
    setRiskProfile(data.riskProfile);
    
    // Save the updated risk profile to localStorage
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
      
      {/* Métriques clés */}
      <KeyMetrics 
        totalIncome={budget.totalIncome}
        totalExpenses={budget.totalExpenses}
        savingsAmount={availableAfterExpenses}
        savingsRate={savingsRate}
      />
      
      {/* Analyse financière */}
      <FinancialRecommendations 
        totalIncome={budget.totalIncome}
        totalExpenses={budget.totalExpenses}
        availableAfterExpenses={availableAfterExpenses}
        monthlyProjectsContribution={monthlyProjectsContribution}
        availableForInvestment={availableForInvestment}
        needsSecurityCushion={needsSecurityCushion}
      />
      
      {/* Graphique de flux de trésorerie */}
      <CashflowChart 
        incomes={budget.incomes}
        expenses={budget.expenses}
        totalIncome={budget.totalIncome}
        totalExpenses={budget.totalExpenses}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section revenus */}
        <Card className="p-6">
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
        
        {/* Section dépenses */}
        <Card className="p-0">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SecurityCushion 
            currentAmount={savingsAccountsTotal}
            targetAmount={targetAmount}
            expenseAmount={monthlyExpenses}
            riskProfile={riskProfile}
            onEditClick={() => setCushionFormOpen(true)}
          />
        </div>
      </div>
      
      {/* Modals */}
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
