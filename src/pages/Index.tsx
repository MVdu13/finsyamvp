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
import { Asset, Transaction } from '@/types/assets';
import { mockAssets } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedAssets = localStorage.getItem('financial-assets');
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
    
    const sidebarState = localStorage.getItem('sidebar-collapsed');
    if (sidebarState) {
      setIsCollapsed(sidebarState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('financial-assets', JSON.stringify(assets));
    window.dispatchEvent(new Event('storage'));
  }, [assets]);
  
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    if (newAsset.type === 'stock' && newAsset.name && newAsset.investmentAccountId) {
      const existingStock = assets.find(asset => 
        asset.type === 'stock' && 
        asset.name === newAsset.name && 
        asset.investmentAccountId === newAsset.investmentAccountId
      );

      if (existingStock) {
        const transaction: Transaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          quantity: newAsset.quantity || 0,
          price: newAsset.purchasePrice || 0,
          total: (newAsset.quantity || 0) * (newAsset.purchasePrice || 0),
          type: 'buy'
        };

        const newQuantity = (existingStock.quantity || 0) + (newAsset.quantity || 0);
        const newValue = (existingStock.value || 0) + transaction.total;
        const newWeightedPrice = newValue / newQuantity;
        
        const updatedAsset: Asset = {
          ...existingStock,
          quantity: newQuantity,
          value: newValue,
          purchasePrice: newWeightedPrice,
          transactions: [...(existingStock.transactions || []), transaction],
          updatedAt: new Date().toISOString()
        };
        
        setAssets(prevAssets => 
          prevAssets.map(asset => 
            asset.id === existingStock.id ? updatedAsset : asset
          )
        );
        
        toast({
          title: "Action mise à jour",
          description: `${newAsset.quantity} ${newAsset.name} ont été ajoutées à votre portefeuille.`
        });
        
        return updatedAsset;
      }
    }
    
    if (newAsset.type === 'crypto' && newAsset.name && newAsset.cryptoAccountId) {
      const existingCrypto = assets.find(asset => 
        asset.type === 'crypto' && 
        asset.name === newAsset.name && 
        asset.cryptoAccountId === newAsset.cryptoAccountId
      );

      if (existingCrypto) {
        const newQuantity = (existingCrypto.quantity || 0) + (newAsset.quantity || 0);
        const newValue = (existingCrypto.value || 0) + ((newAsset.quantity || 0) * (newAsset.purchasePrice || 0));
        const newWeightedPrice = newValue / newQuantity;
        
        const updatedAsset: Asset = {
          ...existingCrypto,
          quantity: newQuantity,
          value: newValue,
          purchasePrice: newWeightedPrice,
          updatedAt: new Date().toISOString()
        };
        
        setAssets(prevAssets => 
          prevAssets.map(asset => 
            asset.id === existingCrypto.id ? updatedAsset : asset
          )
        );
        
        toast({
          title: "Crypto mise à jour",
          description: `${newAsset.quantity} ${newAsset.name} ont été ajoutées à votre portefeuille.`
        });
        
        return updatedAsset;
      }
    }
    
    const asset = {
      ...newAsset,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    if (asset.type === 'stock' && asset.quantity && asset.purchasePrice) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        quantity: asset.quantity,
        price: asset.purchasePrice,
        total: asset.quantity * asset.purchasePrice,
        type: 'buy'
      };
      
      asset.transactions = [transaction];
    }
    
    setAssets(prevAssets => [...prevAssets, asset as Asset]);
    
    toast({
      title: "Actif ajouté",
      description: `${newAsset.name} a été ajouté avec succès.`
    });
    
    return asset as Asset;
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
                assets={assets.filter(asset => asset.type === 'stock' || asset.type === 'investment-account')} 
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
               />;
      case 'crypto':
        return <CryptoPage 
                assets={assets.filter(asset => asset.type === 'crypto' || asset.type === 'crypto-account')} 
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
