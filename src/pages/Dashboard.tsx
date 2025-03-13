
import React, { useState } from 'react';
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import AssetAllocation from '@/components/dashboard/AssetAllocation';
import FinancialGoals from '@/components/dashboard/FinancialGoals';
import AssetsList from '@/components/assets/AssetsList';
import { Asset, AssetType } from '@/types/assets';
import { mockGoals } from '@/lib/mockData';
import AssetForm from '@/components/assets/AssetForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  navigateTo: (item: string) => void;
  openProjectsPage?: () => void; // Make this optional to fix the TS error
}

const Dashboard: React.FC<DashboardProps> = ({ assets, onAddAsset, navigateTo, openProjectsPage }) => {
  // State for the dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // State for asset type tabs
  const [assetTypeTab, setAssetTypeTab] = useState<AssetType>('stock');
  
  // Calculate total value from all assets
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  // Calculate asset allocation from assets
  const currentAllocation = {
    stocks: assets.filter(asset => asset.type === 'stock').reduce((sum, asset) => sum + asset.value, 0),
    realEstate: assets.filter(asset => asset.type === 'real-estate').reduce((sum, asset) => sum + asset.value, 0),
    crypto: assets.filter(asset => asset.type === 'crypto').reduce((sum, asset) => sum + asset.value, 0),
    cash: assets.filter(asset => asset.type === 'cash').reduce((sum, asset) => sum + asset.value, 0),
    bonds: assets.filter(asset => asset.type === 'bonds').reduce((sum, asset) => sum + asset.value, 0),
    commodities: assets.filter(asset => asset.type === 'commodities').reduce((sum, asset) => sum + asset.value, 0),
    other: assets.filter(asset => asset.type === 'other').reduce((sum, asset) => sum + asset.value, 0),
  };
  
  // Générer des données d'historique basées sur le patrimoine actuel
  // pour garantir la cohérence avec les actifs réels
  const generateHistoryData = () => {
    const dates = [
      'Jan 2023', 'Fév 2023', 'Mar 2023', 'Avr 2023', 'Mai 2023', 'Juin 2023',
      'Juil 2023', 'Août 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Déc 2023'
    ];
    
    // Utiliser la valeur totale actuelle pour générer un historique cohérent
    // Le patrimoine actuel correspond au dernier mois
    const baseValue = totalValue > 0 ? totalValue : 1000;
    const factor = baseValue / 1000;
    
    // Générer des valeurs progressives mais cohérentes avec la valeur finale
    const values = [
      Math.round(baseValue * 0.5), 
      Math.round(baseValue * 0.6), 
      Math.round(baseValue * 0.7), 
      Math.round(baseValue * 0.8),
      Math.round(baseValue * 0.85), 
      Math.round(baseValue * 0.9),
      Math.round(baseValue * 0.95), 
      Math.round(baseValue * 0.98),
      Math.round(baseValue * 0.99), 
      Math.round(baseValue * 0.995),
      Math.round(baseValue * 0.998), 
      baseValue
    ];
    
    return { dates, values };
  };
  
  const netWorthHistory = generateHistoryData();
  
  // Calculate period growth (from first to last value in the history)
  const firstValue = netWorthHistory.values[0];
  const lastValue = netWorthHistory.values[netWorthHistory.values.length - 1];
  const periodGrowth = firstValue > 0 
    ? parseFloat(((lastValue - firstValue) / firstValue * 100).toFixed(1))
    : 0;
  
  // Get only the 3 most valuable assets for the quick view
  const topAssets = [...assets].sort((a, b) => b.value - a.value).slice(0, 3);

  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    onAddAsset(asset);
    setDialogOpen(false);
  };
  
  const handleNavigateToAssets = () => {
    navigateTo('assets');
  };

  // Add handler for navigating to projects page
  const handleNavigateToProjects = () => {
    if (openProjectsPage) {
      openProjectsPage();
    } else {
      navigateTo('projects');
    }
  };

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetWorthChart 
            data={netWorthHistory} 
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
          <FinancialGoals 
            goals={mockGoals} 
            onAddGoal={handleNavigateToProjects} 
          />
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
