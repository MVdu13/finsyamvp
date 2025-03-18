
import React, { useState } from 'react';
import NetWorthChart, { AssetCategoryFilter } from '@/components/dashboard/NetWorthChart';
import AssetAllocation from '@/components/dashboard/AssetAllocation';
import FinancialGoals from '@/components/dashboard/FinancialGoals';
import UserProfile from '@/components/dashboard/UserProfile';
import { Asset, AssetType } from '@/types/assets';
import { mockGoals } from '@/lib/mockData';
import AssetForm from '@/components/assets/AssetForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupedAssetsList from '@/components/assets/GroupedAssetsList';

interface DashboardProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  navigateTo: (item: string) => void;
  openProjectsPage?: () => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  assets, 
  onAddAsset, 
  navigateTo, 
  openProjectsPage,
  onDeleteAsset,
  onUpdateAsset 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assetTypeTab, setAssetTypeTab] = useState<AssetType>('stock');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<AssetCategoryFilter>('all');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const filteredAssets = assets.filter(asset => {
    if (assetCategoryFilter === 'all') return true;
    
    if (assetCategoryFilter === 'savings') {
      return asset.type === 'bank-account' || asset.type === 'savings-account';
    }
    
    if (assetCategoryFilter === 'investments') {
      return (
        asset.type === 'real-estate' || 
        asset.type === 'stock' || 
        asset.type === 'crypto' || 
        asset.type === 'bonds'
      );
    }
    
    return true;
  });

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.value, 0);

  const currentAllocation = {
    stocks: filteredAssets.filter(asset => asset.type === 'stock').reduce((sum, asset) => sum + asset.value, 0),
    realEstate: filteredAssets.filter(asset => asset.type === 'real-estate').reduce((sum, asset) => sum + asset.value, 0),
    crypto: filteredAssets.filter(asset => asset.type === 'crypto').reduce((sum, asset) => sum + asset.value, 0),
    bankAccounts: filteredAssets.filter(asset => asset.type === 'bank-account').reduce((sum, asset) => sum + asset.value, 0),
    savingsAccounts: filteredAssets.filter(asset => asset.type === 'savings-account').reduce((sum, asset) => sum + asset.value, 0),
    bonds: filteredAssets.filter(asset => asset.type === 'bonds').reduce((sum, asset) => sum + asset.value, 0),
    commodities: 0,
    other: 0,
  };

  const generateHistoryData = () => {
    const currentDate = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const dates = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - (11 - i));
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    });
    
    const baseValue = totalValue > 0 ? totalValue : 1000;
    
    const growthFactors = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98, 1.0];
    const values = growthFactors.map(factor => Math.round(baseValue * factor));
    
    return { dates, values };
  };

  const netWorthHistory = generateHistoryData();

  const firstValue = netWorthHistory.values[0];
  const lastValue = netWorthHistory.values[netWorthHistory.values.length - 1];
  const periodGrowth = firstValue > 0 
    ? parseFloat(((lastValue - firstValue) / firstValue * 100).toFixed(1))
    : 0;

  const topAssets = [...filteredAssets].sort((a, b) => b.value - a.value).slice(0, 3);

  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    onAddAsset(asset);
    setDialogOpen(false);
  };

  const handleNavigateToAssets = () => {
    navigateTo('assets');
  };

  const handleNavigateToProjects = () => {
    if (openProjectsPage) {
      openProjectsPage();
    } else {
      navigateTo('projects');
    }
  };

  const userProfile = {
    username: 'Jean Dupont',
    netWorth: totalValue,
    riskProfile: 'balanced' as const,
    profileImage: undefined,
  };

  // Grouped assets for display
  const groupedAssets = assets.reduce((groups, asset) => {
    const type = asset.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(asset);
    return groups;
  }, {} as Record<AssetType, Asset[]>);

  // Sort each group by value
  Object.keys(groupedAssets).forEach(type => {
    groupedAssets[type as AssetType].sort((a, b) => b.value - a.value);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre patrimoine</p>
        </div>
        
        <div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="wealth-btn wealth-btn-primary">
                + Nouvel actif
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel actif</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="stock" value={assetTypeTab} onValueChange={(value) => setAssetTypeTab(value as AssetType)}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="stock">Actions</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  <TabsTrigger value="real-estate">Immobilier</TabsTrigger>
                  <TabsTrigger value="other">Autre</TabsTrigger>
                </TabsList>
                <TabsContent value="stock">
                  <AssetForm 
                    onSubmit={handleAddAsset}
                    onCancel={() => setDialogOpen(false)}
                    defaultType="stock"
                    showTypeSelector={false}
                  />
                </TabsContent>
                <TabsContent value="crypto">
                  <AssetForm 
                    onSubmit={handleAddAsset}
                    onCancel={() => setDialogOpen(false)}
                    defaultType="crypto"
                    showTypeSelector={false}
                  />
                </TabsContent>
                <TabsContent value="real-estate">
                  <AssetForm 
                    onSubmit={handleAddAsset}
                    onCancel={() => setDialogOpen(false)}
                    defaultType="real-estate"
                    showTypeSelector={false}
                  />
                </TabsContent>
                <TabsContent value="other">
                  <AssetForm 
                    onSubmit={handleAddAsset}
                    onCancel={() => setDialogOpen(false)}
                    defaultType="cash"
                    showTypeSelector={true}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <UserProfile
        username={userProfile.username}
        profileImage={userProfile.profileImage}
        netWorth={userProfile.netWorth}
        riskProfile={userProfile.riskProfile}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetWorthChart 
            data={netWorthHistory} 
            currentNetWorth={totalValue}
            periodGrowth={periodGrowth}
            selectedCategory={assetCategoryFilter}
            onCategoryChange={setAssetCategoryFilter}
          />
        </div>
        
        <div>
          <AssetAllocation 
            allocation={currentAllocation}
            totalValue={totalValue}
            selectedCategory={assetCategoryFilter}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <FinancialGoals 
            goals={mockGoals} 
            onAddGoal={handleNavigateToProjects} 
          />
        </div>
        
        <div className="lg:col-span-2">
          <GroupedAssetsList 
            groupedAssets={groupedAssets}
            navigateTo={navigateTo}
            onEdit={onUpdateAsset ? (asset) => {
              setEditingAsset(asset);
              setDialogOpen(true);
            } : undefined}
            onDelete={onDeleteAsset}
            hideInvestmentAccounts={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
