
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

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    const asset = {
      ...newAsset,
      id: Date.now().toString(),
    };
    
    setAssets(prevAssets => [...prevAssets, asset]);
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
               />;
      case 'assets':
        // Tous les actifs financiers (incluant les comptes bancaires et livrets)
        return <AssetsPage 
                assets={assets} 
                onAddAsset={addAsset} 
               />;
      case 'budget':
        return <BudgetPage />;
      case 'real-estate':
        return <RealEstatePage assets={assets.filter(asset => asset.type === 'real-estate')} onAddAsset={addAsset} />;
      case 'stocks':
        return <StocksPage assets={assets.filter(asset => asset.type === 'stock')} onAddAsset={addAsset} />;
      case 'crypto':
        return <CryptoPage assets={assets.filter(asset => asset.type === 'crypto')} onAddAsset={addAsset} />;
      case 'projects':
        return <ProjectsPage />;
      case 'bank-accounts':
        // Nouvelle page pour les comptes bancaires
        return <BankAccountsPage 
                assets={assets.filter(asset => asset.type === 'bank-account')} 
                onAddAsset={addAsset} 
               />;
      case 'savings-accounts':
        // Nouvelle page pour les livrets d'épargne
        return <SavingsAccountsPage 
                assets={assets.filter(asset => asset.type === 'savings-account')} 
                onAddAsset={addAsset} 
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
