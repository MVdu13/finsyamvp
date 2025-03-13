
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
import { TimeFrame } from '@/components/charts/TimeFrameSelector';

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
  
  // Générer des données d'historique basées sur la date actuelle
  const generateHistoryData = () => {
    const currentDate = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Créer un tableau de labels pour les 12 derniers mois jusqu'à aujourd'hui
    const dates = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - (11 - i));
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    });
    
    // Utiliser la valeur totale actuelle pour générer un historique cohérent
    // Le patrimoine actuel correspond au dernier mois
    const baseValue = totalValue > 0 ? totalValue : 1000;
    const factor = baseValue / 1000;
    
    // Générer des valeurs progressives mais cohérentes avec la valeur finale
    // Simuler une croissance plus réaliste
    const growthFactors = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98, 1.0];
    const values = growthFactors.map(factor => Math.round(baseValue * factor));
    
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
