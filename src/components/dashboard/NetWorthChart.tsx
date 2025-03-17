
import React, { useState } from 'react';
import LineChart from '../charts/LineChart';
import { BarChart3, Download, Info, Wallet, Coins, BarChart4 } from 'lucide-react';
import { NetWorthHistory } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '../charts/TimeFrameSelector';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '../ui/tooltip';

// Asset category filter types
export type AssetCategoryFilter = 'all' | 'savings' | 'investments';

interface NetWorthChartProps {
  data: NetWorthHistory;
  currentNetWorth: number;
  periodGrowth: number;
  onCategoryChange?: (category: AssetCategoryFilter) => void;
  selectedCategory?: AssetCategoryFilter;
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ 
  data, 
  currentNetWorth,
  periodGrowth,
  onCategoryChange,
  selectedCategory = 'all'
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
    
    // If currentNetWorth is 0, we need to make sure the chart shows zeros
    // instead of being empty
    if (currentNetWorth === 0) {
      filteredValues = filteredValues.map(() => 0);
    }
    
    return {
      labels: filteredDates,
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
  
  // Calculate absolute monetary gain/loss value
  const absoluteGrowth = filteredLastValue - filteredFirstValue;
  
  // Get time period text based on selected timeframe
  const getTimePeriodText = () => {
    switch (timeFrame) {
      case '1M': return 'sur le dernier mois';
      case '3M': return 'sur les 3 derniers mois';
      case '6M': return 'sur les 6 derniers mois';
      case '5Y': return 'sur les 5 dernières années';
      case 'ALL': return 'sur la période complète';
      case '1Y': 
      default: return 'sur les 12 derniers mois';
    }
  };

  // Handler for category filter change
  const handleCategoryChange = (value: string) => {
    if (onCategoryChange) {
      onCategoryChange(value as AssetCategoryFilter);
    }
  };

  // Get category label text
  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'savings': return 'Mon épargne';
      case 'investments': return 'Placements financiers';
      case 'all':
      default: return 'Patrimoine global';
    }
  };

  // Category tooltip descriptions
  const getCategoryTooltipText = (category: AssetCategoryFilter) => {
    switch (category) {
      case 'savings':
        return "Votre épargne comprend les comptes bancaires courants et livrets d'épargne, représentant votre argent facilement disponible.";
      case 'investments':
        return "Les placements financiers regroupent tous vos investissements destinés à générer du rendement : immobilier, actions, crypto, etc.";
      case 'all':
        return "Le patrimoine global représente l'ensemble de votre fortune, comprenant la totalité de votre argent et de vos investissements.";
    }
  };

  // Get the icon for each category
  const getCategoryIcon = (category: AssetCategoryFilter) => {
    switch (category) {
      case 'savings': return <Coins size={16} className="mr-2" />;
      case 'investments': return <BarChart4 size={16} className="mr-2" />;
      case 'all': return <Wallet size={16} className="mr-2" />;
    }
  };

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
          {/* Asset Category Filter with tooltip */}
          <div className="flex items-center">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[210px] font-medium border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <SelectValue placeholder="Catégorie">{getCategoryLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    {getCategoryIcon('all')}
                    Patrimoine global
                  </div>
                </SelectItem>
                <SelectItem value="savings">
                  <div className="flex items-center">
                    {getCategoryIcon('savings')}
                    Mon épargne
                  </div>
                </SelectItem>
                <SelectItem value="investments">
                  <div className="flex items-center">
                    {getCategoryIcon('investments')}
                    Placements financiers
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 ml-1">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Informations sur la catégorie</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white shadow-md border border-gray-200">
                  <div className="text-sm">
                    <p className="font-medium mb-1">Patrimoine global</p>
                    <p className="text-muted-foreground mb-2">{getCategoryTooltipText('all')}</p>
                    
                    <p className="font-medium mb-1">Mon épargne</p>
                    <p className="text-muted-foreground mb-2">{getCategoryTooltipText('savings')}</p>
                    
                    <p className="font-medium mb-1">Placements financiers</p>
                    <p className="text-muted-foreground">{getCategoryTooltipText('investments')}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
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
        <Card className="bg-muted overflow-hidden">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Votre fortune est estimée à</p>
            <p className="text-3xl font-bold">{formatCurrency(currentNetWorth)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-muted overflow-hidden">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Performance</p>
            <div className={`text-2xl font-semibold ${absoluteGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {absoluteGrowth >= 0 ? (
                <>Vous avez gagné {formatCurrency(Math.abs(absoluteGrowth))}</>
              ) : (
                <>Vous avez perdu {formatCurrency(Math.abs(absoluteGrowth))}</>
              )}
            </div>
            <p className={`text-sm ${absoluteGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getTimePeriodText()} ({filteredPeriodGrowth > 0 ? '+' : ''}{filteredPeriodGrowth}%)
            </p>
          </CardContent>
        </Card>
      </div>
      
      <LineChart data={chartData} height={300} />
    </div>
  );
};

export default NetWorthChart;
