
import React from 'react';
import LineChart from '../charts/LineChart';
import { BarChart3, CalendarRange, Download } from 'lucide-react';
import { NetWorthHistory } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';

interface NetWorthChartProps {
  data: NetWorthHistory;
  currentNetWorth: number;
  periodGrowth: number;
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ 
  data, 
  currentNetWorth,
  periodGrowth
}) => {
  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Valeur nette',
        data: data.values,
        color: '#FA5003',
        fill: true,
      }
    ]
  };

  return (
    <div className="wealth-card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Évolution du patrimoine</h3>
          <p className="text-sm text-muted-foreground">12 derniers mois</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <CalendarRange size={18} />
          </button>
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <BarChart3 size={18} />
          </button>
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Valeur actuelle</p>
          <p className="text-2xl font-semibold">{formatCurrency(currentNetWorth)}</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Performance</p>
          <p className={`text-2xl font-semibold ${periodGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {periodGrowth > 0 ? '+' : ''}{periodGrowth}%
          </p>
        </div>
      </div>
      
      <LineChart data={chartData} height={300} />
    </div>
  );
};

export default NetWorthChart;
