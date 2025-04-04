
import React, { useRef, useEffect } from 'react';
import { Income, Expense } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface D3CashflowChartProps {
  incomes: Income[];
  expenses: Expense[];
  totalIncome: number;
  totalExpenses: number;
}

interface SankeyNode {
  name: string;
  value?: number;
  category?: string;
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

interface SankeyLink {
  source: number | SankeyNode;
  target: number | SankeyNode;
  value: number;
  name?: string;
  width?: number;
  color?: string;
  index?: number;
}

const D3CashflowChart: React.FC<D3CashflowChartProps> = ({
  incomes,
  expenses,
  totalIncome,
  totalExpenses
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Prepare data for the sankey diagram
  const prepareData = () => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    // Income node
    nodes.push({ 
      name: `Revenus: ${formatCurrency(totalIncome)}`,
      category: 'income'
    });

    // Budget node
    nodes.push({ 
      name: `Budget: ${formatCurrency(totalIncome)}`,
      category: 'budget'
    });

    links.push({
      source: 0,
      target: 1,
      value: totalIncome,
      name: 'Revenu Total',
      color: '#9b87f580', // Semi-transparent purple
    });

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
      // Use monthlyAmount if available, otherwise fall back to amount
      const categoryTotal = categoryExpenses.reduce((sum, exp) => 
        sum + (exp.monthlyAmount !== undefined ? exp.monthlyAmount : exp.amount), 0
      );
      
      if (categoryTotal > 0) {
        nodes.push({
          name: `${category}: ${formatCurrency(categoryTotal)}`,
          category: 'category',
        });
        
        links.push({
          source: 1,
          target: nodeIndex,
          value: categoryTotal,
          name: category,
          color: getCategoryColorTransparent(category)
        });
        
        categoryExpenses.forEach(expense => {
          // Use monthlyAmount if available, otherwise fall back to amount
          const expenseAmount = expense.monthlyAmount !== undefined ? expense.monthlyAmount : expense.amount;
          
          nodes.push({
            name: `${expense.name}: ${formatCurrency(expenseAmount)}`,
            category: 'expense',
          });
          
          links.push({
            source: nodeIndex,
            target: nodeIndex + 1,
            value: expenseAmount,
            name: expense.name,
            color: getCategoryColorTransparent(category, true)
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
      case 'alimentation':
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

  // Create legend items from unique categories - removing duplicates
  const uniqueCategories = Array.from(
    new Set(expenses.map(expense => expense.category))
  ).filter(Boolean);

  // D3 Sankey chart
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const { nodes, links } = prepareData();
    
    if (nodes.length < 2) return; // Ensure we have at least two nodes

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 700;
    const margin = { top: 20, right: 250, bottom: 20, left: 20 };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeWidth(15)
      .nodePadding(40)
      .extent([[margin.left, margin.top], [innerWidth, innerHeight]]);

    // Convert nodes and links to format expected by d3-sankey
    const sankeyData = {
      nodes: nodes,
      links: links.map(link => ({...link}))
    };

    // Generate the sankey diagram
    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator(sankeyData);

    // Add links - straight lines instead of arcs
    svg.append("g")
      .selectAll("path")
      .data(sankeyLinks)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => (d.color as string) || "#d1d5db")
      .attr("stroke-width", d => Math.max(1, d.width || 0))
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .append("title")
      .text(d => `${d.name}: ${formatCurrency(d.value)}`);

    // Add nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(sankeyNodes)
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add node rectangles
    node.append("rect")
      .attr("height", d => (d.y1 || 0) - (d.y0 || 0))
      .attr("width", d => (d.x1 || 0) - (d.x0 || 0))
      .attr("fill", d => {
        if ((d as SankeyNode).category === 'income') return '#9b87f5';
        if ((d as SankeyNode).category === 'budget') return '#D3E4FD';
        if ((d as SankeyNode).category === 'category') {
          const name = d.name?.split(':')[0].trim() || '';
          return getCategoryColor(name);
        }
        if ((d as SankeyNode).category === 'expense') {
          const name = d.name?.split(':')[0].trim() || '';
          // Try to find the category of the expense based on the name
          for (const category of Object.keys(getCategoryMap())) {
            if (name.toLowerCase().includes(category.toLowerCase())) {
              return getCategoryColor(category, true);
            }
          }
          return '#d1d5db';
        }
        return '#d1d5db';
      })
      .attr("stroke", "#ffdca8")
      .attr("stroke-width", 2)
      .attr("rx", 4)
      .attr("ry", 4)
      .append("title")
      .text(d => d.name);

    // Add node labels
    node.append("text")
      .attr("x", d => (d.x1 || 0) - (d.x0 || 0) + 10)
      .attr("y", d => ((d.y1 || 0) - (d.y0 || 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", "#333333")  // Dark text color for better visibility on white background
      .attr("font-size", "14px")
      .text(d => d.name)
      .call(wrapText, 240);

  }, [incomes, expenses, totalIncome, totalExpenses]);

  // Helper function to wrap text
  const wrapText = (text: d3.Selection<SVGTextElement, SankeyNode, SVGGElement, unknown>, width: number) => {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy") || "0");
      let tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if ((tspan.node()?.getComputedTextLength() || 0) > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  };

  // Helper function to get a map of categories with their respective colors
  const getCategoryMap = () => {
    // Creating a simplified map that avoids duplicates
    return {
      'logement': '#e879f9',
      'nourriture': '#c4b5fd',
      'courses': '#c4b5fd',
      'alimentation': '#c4b5fd',
      'transport': '#a5f3fc',
      'loisirs': '#86efac',
      'sport': '#86efac',
      'santé': '#fda4af',
      'assurance': '#fda4af',
      'assurance vie': '#fda4af',
      'investissement': '#fcd34d',
      'investissements': '#fcd34d',
      'épargne': '#fcd34d',
      'abonnements': '#93c5fd',
      'internet': '#93c5fd',
      'téléphone': '#93c5fd',
      'vie quotidienne': '#fdba74'
    };
  };

  // Create a deduplicated legend that shows each category only once
  const getLegendItems = () => {
    // Map to track seen categories for deduplication
    const seenCategories = new Set<string>();
    const legendItems = [];
    
    // First add income and budget which are always shown
    legendItems.push({ name: 'Revenus', color: '#9b87f5' });
    legendItems.push({ name: 'Budget', color: '#D3E4FD' });
    
    // Then add unique expense categories
    for (const category of uniqueCategories) {
      if (!seenCategories.has(category.toLowerCase())) {
        legendItems.push({ name: category, color: getCategoryColor(category) });
        seenCategories.add(category.toLowerCase());
      }
    }
    
    return legendItems;
  };

  const legendItems = getLegendItems();

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Flux de trésorerie</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 px-4">
          {legendItems.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs truncate">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full overflow-x-auto" style={{ height: '800px' }}>
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
      </CardContent>
    </Card>
  );
};

export default D3CashflowChart;
