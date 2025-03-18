
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

// Define a type for the Label content props to properly handle the payload
interface LabelContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: {
    name?: string;
    [key: string]: any;
  };
  value?: string;
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
      fill: '#1c524a' // Dark teal for income
    });

    // Budget node
    nodes.push({ 
      name: `Virements: ${formatCurrency(totalIncome)}`,
      fill: '#3c6e64' // Medium teal for budget/transfers
    });

    links.push({
      source: 0,
      target: 1,
      value: totalIncome,
      name: 'Revenu Total',
      fill: '#1c524a', // Matching the income node color
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
        
        nodeIndex++;
      }
    });

    return { nodes, links };
  };

  const getCategoryColor = (category: string, isExpense = false) => {
    switch (category.toLowerCase()) {
      case 'logement':
        return '#644E5B'; // Brown/burgundy
      case 'nourriture':
      case 'courses':
      case 'alimentation':
      case 'alimentation et boissons':
        return '#796465'; // Light brownish
      case 'transport':
      case 'transports':
      case 'auto et transports':
        return '#5D5766'; // Purplish gray
      case 'loisirs':
      case 'sport':
      case 'loisirs et divertissements':
        return '#423E4F'; // Dark purple
      case 'santé':
      case 'assurance':
      case 'assurance vie':
        return '#686577'; // Medium purple/gray
      case 'investissement':
      case 'investissements':
      case 'épargne':
      case 'besoins essentiels':
        return '#403E43'; // Charcoal gray
      case 'abonnements':
      case 'internet':
      case 'téléphone':
        return '#534B62'; // Medium purple
      case 'vie quotidienne':
      case 'frais':
        return '#2D2A32'; // Very dark gray/purple
      default:
        return '#555555'; // Default gray
    }
  };

  const getCategoryColorTransparent = (category: string, isExpense = false) => {
    return getCategoryColor(category, isExpense); // Using same colors for links
  };

  const { nodes, links } = prepareData();

  // Create legend items from unique categories
  const uniqueCategories = Array.from(
    new Set(expenses.map(expense => expense.category))
  ).filter(Boolean);

  const chartConfig = {
    income: {
      color: '#1c524a', // Dark teal for income
    },
    expense: {
      color: '#555555', // Gray for expenses
    },
    category: {
      color: '#3c6e64', // Medium teal for categories
    },
    savings: {
      color: '#3c6e64', // Medium teal for savings
    }
  };

  // Custom node component that uses the fill property from the node data
  const CustomizedNodeComponent = (props: any) => {
    const { x, y, width, height, index, payload } = props;
    const fill = payload.fill || '#555555';
    
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        radius={[2, 2, 2, 2]}
      />
    );
  };

  // Always visible labels for nodes
  const renderSankeyLabels = () => {
    return nodes.map((node, index) => (
      <Label
        key={`node-label-${index}`}
        content={(props: any) => {
          const { x, y, width, payload } = props;
          const nodeName = payload.name || '';
          const labelX = index === 0 ? x - 5 : x + width + 10;
          const textAnchor = index === 0 ? "end" : "start";
          
          return (
            <g>
              <text
                x={labelX}
                y={y + 15}
                fill="#e5e5e5"
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="text-xs font-medium"
              >
                {nodeName}
              </text>
            </g>
          );
        }}
      />
    ));
  };

  return (
    <Card className="w-full mb-6 bg-[#121212] border-0 text-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Flux de trésorerie</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="w-full overflow-x-auto" style={{ height: '500px' }}>
          <ChartContainer config={chartConfig}>
            <Sankey
              width={1200} 
              height={400}
              data={{ nodes, links }}
              nodePadding={40}
              nodeWidth={15}
              link={{ stroke: '#333' }}
              node={CustomizedNodeComponent}
              margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
            >
              {renderSankeyLabels()}
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
