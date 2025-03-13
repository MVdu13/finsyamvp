import React from 'react';
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import AssetAllocation from '@/components/dashboard/AssetAllocation';
import FinancialGoals from '@/components/dashboard/FinancialGoals';
import AssetsList from '@/components/assets/AssetsList';
import { Asset, AssetType } from '@/types/assets';
import { mockAssetAllocation, mockNetWorthHistory, mockGoals } from '@/lib/mockData';

interface DashboardProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  navigateTo: (item: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assets, onAddAsset, navigateTo }) => {
  // Calculate total value from all assets
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  // Calculate asset allocation from assets
  const currentAllocation = {
    stocks: assets.filter(asset => asset.type === 'stock').reduce((sum, asset) => sum + asset.value, 0),
    realEstate: assets.filter(asset => asset.type === 'real-estate').reduce((sum, asset) => sum + asset.value, 0),
    crypto: assets.filter(asset => asset.type === 'crypto').reduce((sum, asset) => sum + asset.value, 0),
    cash: assets.filter(asset => asset.type === 'cash').reduce((sum, asset) => sum + asset.value, 0),
    bonds: assets.filter(asset => asset.type === ('bonds' as AssetType)).reduce((sum, asset) => sum + asset.value, 0) || 0,
    commodities: assets.filter(asset => asset.type === ('commodities' as AssetType)).reduce((sum, asset) => sum + asset.value, 0) || 0,
    other: assets.filter(asset => asset.type === 'other').reduce((sum, asset) => sum + asset.value, 0),
  };
  
  // Calculate period growth (from first to last value in the history)
  const firstValue = mockNetWorthHistory.values[0];
  const lastValue = mockNetWorthHistory.values[mockNetWorthHistory.values.length - 1];
  const periodGrowth = firstValue > 0 
    ? parseFloat(((lastValue - firstValue) / firstValue * 100).toFixed(1))
    : 0;
  
  // Get only the 3 most valuable assets for the quick view
  const topAssets = [...assets].sort((a, b) => b.value - a.value).slice(0, 3);

  const handleAddAsset = () => {
    navigateTo('assets');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre patrimoine</p>
        </div>
        
        <div>
          <button className="wealth-btn wealth-btn-primary" onClick={handleAddAsset}>
            + Nouvel actif
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetWorthChart 
            data={mockNetWorthHistory} 
            currentNetWorth={totalValue}
            periodGrowth={periodGrowth}
          />
        </div>
        
        <div>
          <AssetAllocation 
            allocation={currentAllocation}
            totalValue={totalValue}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinancialGoals goals={mockGoals} />
        </div>
        
        <div>
          <AssetsList 
            assets={topAssets}
            title="Actifs principaux"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
