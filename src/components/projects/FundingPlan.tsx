
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProjectPlan } from '@/types/goals';
import { CalendarDays, ArrowRight } from 'lucide-react';

interface FundingPlanProps {
  targetAmount: number;
  currentAmount: number;
  monthlySavings: number;
  onSelectPlan: (plan: ProjectPlan) => void;
}

const FundingPlan: React.FC<FundingPlanProps> = ({ 
  targetAmount, 
  currentAmount, 
  monthlySavings,
  onSelectPlan
}) => {
  const remainingAmount = targetAmount - currentAmount;
  
  // Generate plans
  const generatePlans = () => {
    const plans: ProjectPlan[] = [];
    
    // Plan 1: 3 months
    if (monthlySavings > 0) {
      const threeMonthPlan = calculatePlan(3);
      if (threeMonthPlan) plans.push(threeMonthPlan);
    }
    
    // Plan 2: 6 months
    if (monthlySavings > 0) {
      const sixMonthPlan = calculatePlan(6);
      if (sixMonthPlan) plans.push(sixMonthPlan);
    }
    
    // Plan 3: 12 months
    if (monthlySavings > 0) {
      const twelveMonthPlan = calculatePlan(12);
      if (twelveMonthPlan) plans.push(twelveMonthPlan);
    }
    
    // Plan 4: Based on current saving rate
    if (monthlySavings > 0) {
      const timeToTarget = Math.ceil(remainingAmount / monthlySavings);
      if (timeToTarget > 0 && timeToTarget !== 3 && timeToTarget !== 6 && timeToTarget !== 12) {
        const regularPlan = calculatePlan(timeToTarget);
        if (regularPlan) plans.push(regularPlan);
      }
    }
    
    // If no plan could be generated with monthly savings
    if (plans.length === 0) {
      plans.push({
        id: 'no-savings',
        monthlyContribution: 0,
        totalContribution: 0,
        timeToTarget: 0,
        fromSavings: 0,
        fromBudget: 0
      });
    }
    
    return plans;
  };
  
  const calculatePlan = (months: number): ProjectPlan | null => {
    if (months <= 0) return null;
    
    const monthlyContribution = Math.ceil(remainingAmount / months);
    const fromSavings = Math.min(monthlySavings, monthlyContribution);
    const fromBudget = Math.max(0, monthlyContribution - fromSavings);
    
    return {
      id: `plan-${months}`,
      monthlyContribution,
      totalContribution: monthlyContribution * months,
      timeToTarget: months,
      fromSavings,
      fromBudget
    };
  };
  
  const plans = generatePlans();
  
  return (
    <div className="bg-muted rounded-lg p-4">
      <h3 className="font-medium mb-4">Plans de financement suggérés</h3>
      
      {remainingAmount <= 0 ? (
        <div className="text-center py-2 bg-green-50 text-green-700 rounded-md">
          Votre projet est déjà entièrement financé !
        </div>
      ) : monthlySavings === 0 ? (
        <div className="text-center py-2 bg-yellow-50 text-yellow-700 rounded-md mb-4">
          Vous n'avez actuellement aucune épargne mensuelle disponible.
          Ajustez votre budget pour dégager une capacité d'épargne.
        </div>
      ) : (
        <Tabs defaultValue={plans[0]?.id} className="w-full">
          <TabsList className="w-full mb-4">
            {plans.map((plan) => (
              <TabsTrigger key={plan.id} value={plan.id} className="flex-1">
                {plan.timeToTarget === 0 
                  ? "Impossible" 
                  : `${plan.timeToTarget} mois`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {plans.map((plan) => (
            <TabsContent key={plan.id} value={plan.id} className="space-y-4">
              {plan.timeToTarget === 0 ? (
                <div className="text-center py-2 bg-yellow-50 text-yellow-700 rounded-md">
                  Vous devez augmenter votre capacité d'épargne mensuelle pour financer ce projet.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays size={16} className="text-muted-foreground" />
                      <span>Durée :</span>
                    </div>
                    <span className="font-medium">{plan.timeToTarget} mois</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Contribution mensuelle</p>
                      <p className="text-lg font-medium">{formatCurrency(plan.monthlyContribution)}</p>
                    </div>
                    
                    <div className="p-3 bg-background rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Montant restant</p>
                      <p className="text-lg font-medium">{formatCurrency(remainingAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 py-2 px-3 bg-background rounded-md">
                    <div className="flex-grow">
                      <p className="text-xs text-muted-foreground mb-1">Depuis l'épargne mensuelle</p>
                      <p className="font-medium">{formatCurrency(plan.fromSavings)}</p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground" />
                    <div className="flex-grow">
                      <p className="text-xs text-muted-foreground mb-1">À dégager en plus</p>
                      <p className="font-medium">{formatCurrency(plan.fromBudget)}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-2 bg-wealth-primary text-white rounded-md hover:bg-wealth-primary/90 transition-colors"
                    onClick={() => onSelectPlan(plan)}
                  >
                    Appliquer ce plan
                  </button>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default FundingPlan;
