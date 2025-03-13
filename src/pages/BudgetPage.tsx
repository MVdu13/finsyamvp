
import React from 'react';
import { mockBudget, mockGoals } from '@/lib/mockData';
import BudgetOverview from '@/components/budget/BudgetOverview';
import SecurityCushion from '@/components/budget/SecurityCushion';
import { PiggyBank, Download, Clock, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

const BudgetPage = () => {
  // Calculate security cushion details
  const monthlyExpenses = mockBudget.totalExpenses;
  const currentSavings = 15000; // This would come from the user's data
  const recommendedMonths = 6; // Medium risk profile
  const targetAmount = monthlyExpenses * recommendedMonths;

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
          <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetOverview budget={mockBudget} />
        </div>
        
        <div>
          <SecurityCushion 
            currentAmount={currentSavings}
            targetAmount={targetAmount}
            expenseAmount={monthlyExpenses}
            riskProfile="medium"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="wealth-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Revenus</h3>
            <button className="wealth-btn wealth-btn-outline text-xs">
              + Ajouter
            </button>
          </div>
          
          <div className="space-y-4">
            {mockBudget.incomes.map((income) => (
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
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatCurrency(income.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total des revenus</span>
              <span className="font-medium text-green-600">{formatCurrency(mockBudget.totalIncome)}</span>
            </div>
          </div>
        </div>
        
        <div className="wealth-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Dépenses mensuelles</h3>
            <button className="wealth-btn wealth-btn-outline text-xs">
              + Ajouter
            </button>
          </div>
          
          <div className="space-y-4">
            {mockBudget.expenses.map((expense) => (
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
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total des dépenses</span>
              <span className="font-medium text-red-600">{formatCurrency(mockBudget.totalExpenses)}</span>
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
              Avec un revenu mensuel de {formatCurrency(mockBudget.totalIncome)} et des dépenses de {formatCurrency(mockBudget.totalExpenses)}, 
              vous pouvez épargner {formatCurrency(mockBudget.totalIncome - mockBudget.totalExpenses)} chaque mois.
              Nous recommandons d'allouer {formatCurrency(mockBudget.savings)} à l'épargne de sécurité et 
              {formatCurrency(mockBudget.investment)} aux investissements.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Optimisation des dépenses</h4>
            <p className="text-sm text-blue-700">
              Vos dépenses non essentielles représentent {formatCurrency(mockBudget.expenses
                .filter(e => !e.essential)
                .reduce((sum, e) => sum + e.amount, 0))} par mois. 
              Envisagez de réduire les abonnements non utilisés pour économiser davantage.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Objectifs financiers</h4>
            <p className="text-sm text-purple-700">
              Pour atteindre vos objectifs financiers plus rapidement, augmentez vos contributions mensuelles. 
              Avec {formatCurrency(mockGoals.reduce((sum, goal) => sum + goal.monthlyContribution, 0))} actuellement dédiés à vos projets,
              vous pourriez accélérer la réalisation de votre objectif prioritaire en réallouant 200€ supplémentaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
