
import React from 'react';
import { Income, Expense } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey, Tooltip, Rectangle, Label } from 'recharts';
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

    // Income node
    nodes.push({ 
      name: `Revenus: ${formatCurrency(totalIncome)}`, 
      fill: '#9b87f5' // Primary purple for income
    });

    // Budget node
    nodes.push({ 
      name: `Budget: ${formatCurrency(totalIncome)}`,
      fill: '#D3E4FD' // Soft blue for budget
    });

    links.push({
      source: 0,
      target: 1,
      value: totalIncome,
      name: 'Revenu Total',
      fill: '#9b87f580', // Semi-transparent purple
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

  // Create legend items from unique categories
  const uniqueCategories = Array.from(
    new Set(expenses.map(expense => expense.category))
  ).filter(Boolean);

  const chartConfig = {
    income: {
      color: '#9b87f5', // Primary purple for income
    },
    expense: {
      color: '#F97316', // Bright orange for expenses
    },
    category: {
      color: '#D3E4FD', // Soft blue for categories
    },
    savings: {
      color: '#F2FCE2', // Soft green for savings
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Flux de trésorerie</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#9b87f5]"></div>
            <span className="text-xs">Revenus</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#D3E4FD]"></div>
            <span className="text-xs">Budget</span>
          </div>
          {uniqueCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getCategoryColor(category) }}
              ></div>
              <span className="text-xs truncate">{category}</span>
            </div>
          ))}
        </div>
        <div className="w-full overflow-x-auto" style={{ height: '800px' }}>
          <ChartContainer config={chartConfig}>
            <Sankey
              width={800}
              height={480}
              data={{ nodes, links }}
              nodePadding={20}
              nodeWidth={15}
              link={{ stroke: '#d1d5db' }}
              node={<Rectangle radius={[4, 4, 4, 4]} />}
              margin={{ top: 20, right: 200, bottom: 20, left: 200 }}
            >
              <Label
                position="right"
                offset={10}
                content={({ x, y, width, height, index, payload }) => {
                  if (!payload || !payload.name) return null;
                  const value = payload.name || '';
                  const xPos = (x || 0) + (width || 0) + 6;
                  const yPos = (y || 0) + (height || 0) / 2;
                  
                  return (
                    <g>
                      <text 
                        x={xPos} 
                        y={yPos} 
                        fill="#333" 
                        textAnchor="start" 
                        dominantBaseline="middle"
                        className="text-xs font-medium"
                      >
                        {value}
                      </text>
                    </g>
                  );
                }}
              />
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
