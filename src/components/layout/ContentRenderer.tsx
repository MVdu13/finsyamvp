
import React from 'react';
import { Asset } from '@/types/assets';
import Dashboard from '@/pages/Dashboard';
import AssetsPage from '@/pages/AssetsPage';
import BudgetPage from '@/pages/BudgetPage';
import RealEstatePage from '@/pages/RealEstatePage';
import StocksPage from '@/pages/StocksPage';
import CryptoPage from '@/pages/CryptoPage';
import ProjectsPage from '@/pages/ProjectsPage';
import BankAccountsPage from '@/pages/BankAccountsPage';
import SavingsAccountsPage from '@/pages/SavingsAccountsPage';
import CompoundInterestPage from '@/pages/CompoundInterestPage';
import CreditSimulatorPage from '@/pages/CreditSimulatorPage';
import PortfolioRebalancerPage from '@/pages/PortfolioRebalancerPage';

interface ContentRendererProps {
  activeItem: string;
  assets: Asset[];
  totalWealth: number;
  onAddAsset: (newAsset: Omit<Asset, 'id'>) => Asset;
  onUpdateAsset: (idOrAsset: string | Asset, maybeAsset?: Partial<Asset>) => void;
  onDeleteAsset: (assetId: string) => void;
  navigateTo: (item: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  activeItem,
  assets,
  totalWealth,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  navigateTo
}) => {
  const openProjectsPage = () => {
    navigateTo('projects');
  };

  switch (activeItem) {
    case 'dashboard':
      return <Dashboard 
               assets={assets} 
               onAddAsset={onAddAsset} 
               navigateTo={navigateTo} 
               openProjectsPage={openProjectsPage}
               onDeleteAsset={onDeleteAsset}
               onUpdateAsset={onUpdateAsset} 
             />;
    case 'assets':
      return <AssetsPage 
              assets={assets} 
              onAddAsset={onAddAsset}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
             />;
    case 'budget':
      return <BudgetPage />;
    case 'real-estate':
      return <RealEstatePage 
              assets={assets.filter(asset => asset.type === 'real-estate')} 
              onAddAsset={onAddAsset}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
             />;
    case 'stocks':
      return <StocksPage 
              assets={assets.filter(asset => asset.type === 'stock' || asset.type === 'investment-account')} 
              onAddAsset={onAddAsset}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
             />;
    case 'crypto':
      return <CryptoPage 
              assets={assets.filter(asset => asset.type === 'crypto' || asset.type === 'crypto-account')} 
              onAddAsset={onAddAsset}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
             />;
    case 'projects':
      return <ProjectsPage />;
    case 'bank-accounts':
      return <BankAccountsPage 
              assets={assets.filter(asset => asset.type === 'bank-account')} 
              onAddAsset={onAddAsset}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
              totalWealth={totalWealth}
             />;
    case 'savings-accounts':
      return <SavingsAccountsPage 
              assets={assets.filter(asset => asset.type === 'savings-account')} 
              onAddAsset={onAddAsset}
              onUpdateAsset={onUpdateAsset}
              onDeleteAsset={onDeleteAsset}
             />;
    case 'compound-interest':
      return <CompoundInterestPage />;
    case 'credit-simulator':
      return <CreditSimulatorPage />;
    case 'portfolio-rebalancer':
      return <PortfolioRebalancerPage />;
    default:
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold">Page en construction</h1>
          <p className="text-muted-foreground">Cette section sera bientôt disponible.</p>
        </div>
      );
  }
};

export default ContentRenderer;
