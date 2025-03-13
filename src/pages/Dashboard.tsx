
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import AssetAllocation from '@/components/dashboard/AssetAllocation';
import FinancialGoals from '@/components/dashboard/FinancialGoals';
import AssetsList from '@/components/assets/AssetsList';
import { mockAssets, mockAssetAllocation, mockNetWorthHistory, mockGoals } from '@/lib/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  // Calculate total value
  const totalValue = Object.values(mockAssetAllocation).reduce((sum, value) => sum + value, 0);
  
  // Calculate period growth (from first to last value in the history)
  const firstValue = mockNetWorthHistory.values[0];
  const lastValue = mockNetWorthHistory.values[mockNetWorthHistory.values.length - 1];
  const periodGrowth = firstValue > 0 
    ? parseFloat(((lastValue - firstValue) / firstValue * 100).toFixed(1))
    : 0;
  
  // Get only the 3 most valuable assets for the quick view
  const topAssets = [...mockAssets].sort((a, b) => b.value - a.value).slice(0, 3);

  const handleAddAsset = () => {
    navigate('/assets');
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
            allocation={mockAssetAllocation}
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
