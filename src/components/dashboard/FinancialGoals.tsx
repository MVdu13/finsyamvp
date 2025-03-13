
import React from 'react';
import { Target, Clock, TrendingUp } from 'lucide-react';
import { FinancialGoal } from '@/types/goals';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface FinancialGoalsProps {
  goals: FinancialGoal[];
}

const FinancialGoals: React.FC<FinancialGoalsProps> = ({ goals }) => {
  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-medium">Objectifs financiers</h3>
        
        <button className="wealth-btn wealth-btn-outline text-xs">
          + Ajouter
        </button>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Aucun objectif défini
            </div>
          ) : (
            goals.map((goal) => {
              const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              return (
                <div 
                  key={goal.id} 
                  className={cn(
                    "p-4 rounded-lg border border-border transition-all",
                    goal.priority === 'high' 
                      ? "border-l-4 border-l-wealth-primary" 
                      : goal.priority === 'medium'
                      ? "border-l-4 border-l-yellow-500"
                      : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        goal.type === 'savings' ? "bg-blue-100" : 
                        goal.type === 'investment' ? "bg-green-100" : 
                        "bg-wealth-primary/10"
                      )}>
                        {goal.type === 'savings' ? (
                          <Clock size={16} className="text-blue-600" />
                        ) : goal.type === 'investment' ? (
                          <TrendingUp size={16} className="text-green-600" />
                        ) : (
                          <Target size={16} className="text-wealth-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {goal.monthlyContribution > 0 
                            ? `${formatCurrency(goal.monthlyContribution)}/mois` 
                            : "Pas de contribution régulière"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {goal.timeframe}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted-foreground">{progress}%</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill bg-wealth-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total contribution mensuelle</span>
            <span className="font-medium">
              {formatCurrency(goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoals;
