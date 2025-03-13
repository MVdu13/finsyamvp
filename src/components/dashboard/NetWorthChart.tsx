
import React, { useState } from 'react';
import LineChart from '../charts/LineChart';
import { BarChart3, Download } from 'lucide-react';
import { NetWorthHistory } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '../charts/TimeFrameSelector';
import { Button } from '../ui/button';

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
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  // Filter data based on selected time frame
  const getFilteredData = () => {
    const currentDate = new Date();
    let filteredDates = [...data.dates];
    let filteredValues = [...data.values];
    
    // Filter based on time frame
    if (timeFrame !== 'ALL') {
      let monthsToShow = 12; // Default for 1Y
      
      switch (timeFrame) {
        case '1M':
          monthsToShow = 1;
          break;
        case '3M':
          monthsToShow = 3;
          break;
        case '6M':
          monthsToShow = 6;
          break;
        case '5Y':
          monthsToShow = 60; // We'll show all available data, limited to what we have
          break;
      }
      
      // Take only the last X months of data
      const dataLength = filteredDates.length;
      if (dataLength > monthsToShow) {
        filteredDates = filteredDates.slice(dataLength - monthsToShow);
        filteredValues = filteredValues.slice(dataLength - monthsToShow);
      }
    }
    
    return {
      labels: filteredDates, // Changed from data.labels to filteredDates
      datasets: [
        {
          label: 'Valeur nette',
          data: filteredValues,
          color: '#FA5003',
          fill: true,
        }
      ]
    };
  };

  const chartData = getFilteredData();
  
  // Calculate period growth based on filtered data
  const filteredFirstValue = chartData.datasets[0].data[0] || 0;
  const filteredLastValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1] || 0;
  const filteredPeriodGrowth = filteredFirstValue > 0 
    ? parseFloat(((filteredLastValue - filteredFirstValue) / filteredFirstValue * 100).toFixed(1))
    : 0;

  return (
    <div className="wealth-card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Évolution du patrimoine</h3>
          <p className="text-sm text-muted-foreground">
            {timeFrame === '1Y' ? '12 derniers mois' : 
             timeFrame === '1M' ? 'Dernier mois' : 
             timeFrame === '3M' ? '3 derniers mois' : 
             timeFrame === '6M' ? '6 derniers mois' : 
             timeFrame === '5Y' ? '5 dernières années' : 'Historique complet'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TimeFrameSelector 
            selectedTimeFrame={timeFrame} 
            onTimeFrameChange={setTimeFrame} 
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <BarChart3 size={18} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Download size={18} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Valeur actuelle</p>
          <p className="text-2xl font-semibold">{formatCurrency(currentNetWorth)}</p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Performance</p>
          <p className={`text-2xl font-semibold ${filteredPeriodGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {filteredPeriodGrowth > 0 ? '+' : ''}{filteredPeriodGrowth}%
          </p>
        </div>
      </div>
      
      <LineChart data={chartData} height={300} />
    </div>
  );
};

export default NetWorthChart;
