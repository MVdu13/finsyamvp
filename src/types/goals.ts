
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
