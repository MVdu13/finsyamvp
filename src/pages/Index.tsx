
import React, { useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from './Dashboard';
import AssetsPage from './AssetsPage';
import BudgetPage from './BudgetPage';
import RealEstatePage from './RealEstatePage';
import StocksPage from './StocksPage';
import CryptoPage from './CryptoPage';
import ProjectsPage from './ProjectsPage';
import BankAccountsPage from './BankAccountsPage';
import SavingsAccountsPage from './SavingsAccountsPage';
import { Asset } from '@/types/assets';
import { mockAssets } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    const asset = {
      ...newAsset,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setAssets(prevAssets => [...prevAssets, asset]);
    
    toast({
      title: "Actif ajouté",
      description: `${newAsset.name} a été ajouté avec succès.`
    });
  };
  
  // Updated to match the expected signature (id: string, asset: Partial<Asset>)
  const updateAsset = (id: string, updatedAssetData: Partial<Asset>) => {
    setAssets(prevAssets => 
      prevAssets.map(asset => 
        asset.id === id ? { ...asset, ...updatedAssetData } : asset
      )
    );
    
    toast({
      title: "Actif mis à jour",
      description: `L'actif a été mis à jour avec succès.`
    });
  };
  
  const deleteAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
    
    toast({
      title: "Actif supprimé",
      description: "L'actif a été supprimé avec succès."
    });
  };

  // Fonction pour naviguer directement vers la page des projets
  const openProjectsPage = () => {
    setActiveItem('projects');
  };

  // Render the right content based on active item
  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard 
                 assets={assets} 
                 onAddAsset={addAsset} 
                 navigateTo={setActiveItem} 
                 openProjectsPage={openProjectsPage}
                 onDeleteAsset={deleteAsset}
                 onUpdateAsset={updateAsset} 
               />;
      case 'assets':
        return <AssetsPage 
                assets={assets} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      case 'budget':
        return <BudgetPage />;
      case 'real-estate':
        return <RealEstatePage 
                assets={assets.filter(asset => asset.type === 'real-estate')} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      case 'stocks':
        return <StocksPage 
                assets={assets.filter(asset => asset.type === 'stock')} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      case 'crypto':
        return <CryptoPage 
                assets={assets.filter(asset => asset.type === 'crypto')} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      case 'projects':
        return <ProjectsPage />;
      case 'bank-accounts':
        return <BankAccountsPage 
                assets={assets.filter(asset => asset.type === 'bank-account')} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      case 'savings-accounts':
        return <SavingsAccountsPage 
                assets={assets.filter(asset => asset.type === 'savings-account')} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold">Page en construction</h1>
            <p className="text-muted-foreground">Cette section sera bientôt disponible.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar 
        isCollapsed={isCollapsed} 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        toggleSidebar={toggleSidebar}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[80px]' : 'ml-[280px]'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
