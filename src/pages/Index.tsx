
import React, { useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from './Dashboard';
import AssetsPage from './AssetsPage';
import BudgetPage from './BudgetPage';
import RealEstatePage from './RealEstatePage';

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Render the right content based on active item
  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard />;
      case 'assets':
        return <AssetsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'real-estate':
        return <RealEstatePage />;
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
