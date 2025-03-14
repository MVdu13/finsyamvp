
import React from 'react';
import DonutChart from '../charts/DonutChart';
import { Info, Settings } from 'lucide-react';
import { AssetAllocation as AssetAllocationType } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { AssetCategoryFilter } from './NetWorthChart';

interface AssetAllocationProps {
  allocation: AssetAllocationType;
  totalValue: number;
  selectedCategory?: AssetCategoryFilter;
}

const AssetAllocation: React.FC<AssetAllocationProps> = ({ 
  allocation, 
  totalValue,
  selectedCategory = 'all'
}) => {
  const chartData = {
    labels: Object.keys(allocation).map(key => {
      switch(key) {
        case 'stocks': return 'Actions';
        case 'realEstate': return 'Immobilier';
        case 'crypto': return 'Cryptomonnaies';
        case 'cash': return 'Liquidités';
        case 'bonds': return 'Obligations';
        case 'commodities': return 'Matières premières';
        case 'other': return 'Autres';
        default: return key;
      }
    }),
    values: Object.values(allocation) as number[],
    colors: [
      '#4ade80', // stocks - green
      '#60a5fa', // real estate - blue
      '#c084fc', // crypto - purple
      '#94a3b8', // cash/liquidity - gray (keeping this color for liquidity)
      '#facc15', // bonds - yellow
      '#f97316', // commodities - orange
      '#f43f5e'  // other - pink
    ],
  };

  // Generate title based on selected category
  let title = 'Allocation d\'actifs';
  if (selectedCategory === 'assets') {
    title = 'Allocation d\'actifs financiers';
  } else if (selectedCategory === 'liabilities') {
    title = 'Allocation des passifs';
  }

  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">Valeur totale: {formatCurrency(totalValue)}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <Info size={18} />
          </button>
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-grow">
        <DonutChart data={chartData} height={260} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(allocation).map(([key, value]) => {
            const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0.0';
            let label;
            switch(key) {
              case 'stocks': label = 'Actions'; break;
              case 'realEstate': label = 'Immobilier'; break;
              case 'crypto': label = 'Crypto'; break;
              case 'cash': label = 'Liquidités'; break; // Cash now correctly represents bank accounts + savings accounts
              case 'bonds': label = 'Obligations'; break;
              case 'commodities': label = 'Mat. prem.'; break;
              default: label = 'Autres';
            }
            
            return (
              <div key={key} className="text-xs">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium">{percent}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
