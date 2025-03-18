
import React from 'react';
import { Income, Expense } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey, Tooltip, Rectangle } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CashflowChartProps {
  incomes: Income[];
  expenses: Expense[];
  totalIncome: number;
  totalExpenses: number;
}

interface SankeyNode {
  name: string;
  value?: number;
  fill?: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
  name?: string;
  fill?: string;
}

const CashflowChart: React.FC<CashflowChartProps> = ({
  incomes,
  expenses,
  totalIncome,
  totalExpenses
}) => {
  const prepareData = () => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    nodes.push({ 
      name: `Revenus: ${formatCurrency(totalIncome)}`, 
      fill: '#a5b4fc' // Light blue
    });

    nodes.push({ 
      name: `Budget: ${formatCurrency(totalIncome)}`,
      fill: '#fdba74' // Light orange
    });

    links.push({
      source: 0,
      target: 1,
      value: totalIncome,
      fill: '#a5b4fc80', // Transparent light blue
    });

    const fixedExpenses = expenses.filter(expense => expense.type === 'fixed');
    const variableExpenses = expenses.filter(expense => expense.type === 'variable');
    
    const expenseCategories: Record<string, { fixed: Expense[], variable: Expense[] }> = {};
    
    expenses.forEach(expense => {
      if (!expenseCategories[expense.category]) {
        expenseCategories[expense.category] = {
          fixed: [],
          variable: []
        };
      }
      
      if (expense.type === 'fixed') {
        expenseCategories[expense.category].fixed.push(expense);
      } else {
        expenseCategories[expense.category].variable.push(expense);
      }
    });

    let nodeIndex = 2;
    
    Object.entries(expenseCategories).forEach(([category, { fixed, variable }]) => {
      const categoryExpenses = [...fixed, ...variable];
      const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      if (categoryTotal > 0) {
        nodes.push({
          name: `${category}: ${formatCurrency(categoryTotal)}`,
          fill: getCategoryColor(category)
        });
        
        links.push({
          source: 1,
          target: nodeIndex,
          value: categoryTotal,
          name: category,
          fill: getCategoryColorTransparent(category)
        });
        
        categoryExpenses.forEach(expense => {
          nodes.push({
            name: `${expense.name}: ${formatCurrency(expense.amount)}`,
            fill: getCategoryColor(category, true)
          });
          
          links.push({
            source: nodeIndex,
            target: nodeIndex + 1,
            value: expense.amount,
            name: expense.name,
            fill: getCategoryColorTransparent(category, true)
          });
          
          nodeIndex++;
        });
        
        nodeIndex++;
      }
    });

    return { nodes, links };
  };

  const getCategoryColor = (category: string, isExpense = false) => {
    const opacity = isExpense ? '80' : '';
    
    switch (category.toLowerCase()) {
      case 'logement':
        return `#e879f9${opacity}`; // Pink
      case 'nourriture':
      case 'courses':
        return `#c4b5fd${opacity}`; // Purple
      case 'transport':
        return `#a5f3fc${opacity}`; // Cyan
      case 'loisirs':
      case 'sport':
        return `#86efac${opacity}`; // Green
      case 'santé':
      case 'assurance':
      case 'assurance vie':
        return `#fda4af${opacity}`; // Red
      case 'investissement':
      case 'investissements':
      case 'épargne':
        return `#fcd34d${opacity}`; // Yellow
      case 'abonnements':
      case 'internet':
      case 'téléphone':
        return `#93c5fd${opacity}`; // Blue
      case 'vie quotidienne':
        return `#fdba74${opacity}`; // Orange
      default:
        return `#d1d5db${opacity}`; // Gray
    }
  };

  const getCategoryColorTransparent = (category: string, isExpense = false) => {
    return getCategoryColor(category, isExpense) + '80'; // 50% opacity
  };

  const { nodes, links } = prepareData();

  const chartConfig = {
    income: {
      color: '#a5b4fc',
    },
    expense: {
      color: '#fdba74',
    },
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Flux de trésorerie</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="w-full" style={{ height: '600px' }}>
          <ChartContainer config={chartConfig}>
            <Sankey
              width={800}
              height={480}
              data={{ nodes, links }}
              nodePadding={10}
              nodeWidth={10}
              link={{ stroke: '#d1d5db' }}
              node={
                <Rectangle 
                  fill="#a5b4fc"
                  radius={[2, 2, 2, 2]}
                />
              }
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Tooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [formatCurrency(value as number), name]}
                  />
                }
              />
            </Sankey>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashflowChart;
