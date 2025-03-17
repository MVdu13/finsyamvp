
import React, { useState, useEffect } from 'react';
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
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  // Load assets from localStorage on initial load
  useEffect(() => {
    const storedAssets = localStorage.getItem('financial-assets');
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
    
    // Load sidebar state from localStorage if available
    const sidebarState = localStorage.getItem('sidebar-collapsed');
    if (sidebarState) {
      setIsCollapsed(sidebarState === 'true');
    }
  }, []);

  // Update localStorage whenever assets change
  useEffect(() => {
    localStorage.setItem('financial-assets', JSON.stringify(assets));
    // Create a storage event to notify other components that assets have changed
    window.dispatchEvent(new Event('storage'));
  }, [assets]);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Calculate the total wealth (value of all assets)
  const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

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
  
  const updateAsset = (idOrAsset: string | Asset, maybeAsset?: Partial<Asset>) => {
    if (typeof idOrAsset === 'string' && maybeAsset) {
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === idOrAsset ? { ...asset, ...maybeAsset } : asset
        )
      );
      
      toast({
        title: "Actif mis à jour",
        description: `L'actif a été mis à jour avec succès.`
      });
    } 
    else if (typeof idOrAsset === 'object' && 'id' in idOrAsset) {
      const updatedAsset = idOrAsset;
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === updatedAsset.id ? updatedAsset : asset
        )
      );
      
      toast({
        title: "Actif mis à jour",
        description: `${updatedAsset.name} a été mis à jour avec succès.`
      });
    }
  };
  
  const deleteAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
    
    toast({
      title: "Actif supprimé",
      description: "L'actif a été supprimé avec succès."
    });
  };

  const openProjectsPage = () => {
    setActiveItem('projects');
  };

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
                totalWealth={totalWealth} // Pass the total wealth to calculate the ratio
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
