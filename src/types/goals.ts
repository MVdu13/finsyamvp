
export type GoalType = 'savings' | 'investment' | 'project';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface FinancialGoal {
  id: string;
  name: string;
  description?: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  startDate: string;
  targetDate: string;
  priority: PriorityLevel;
  timeframe: string;
}

export interface ProjectPlan {
  id: string;
  monthlyContribution: number;
  totalContribution: number;
  timeToTarget: number; // in months
  fromSavings: number;
  fromBudget: number;
}
