
import React from 'react';
import AppSidebar from '@/components/AppSidebar';
import ContentRenderer from '@/components/layout/ContentRenderer';
import { useSidebarState } from '@/hooks/useSidebarState';
import { useAssetManager } from '@/hooks/useAssetManager';

const Index = () => {
  const { isCollapsed, activeItem, setActiveItem, toggleSidebar } = useSidebarState();
  const { assets, totalWealth, addAsset, updateAsset, deleteAsset } = useAssetManager();

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar 
        isCollapsed={isCollapsed} 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        toggleSidebar={toggleSidebar}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[80px]' : 'ml-[280px]'}`}>
        <ContentRenderer 
          activeItem={activeItem}
          assets={assets}
          totalWealth={totalWealth}
          onAddAsset={addAsset}
          onUpdateAsset={updateAsset}
          onDeleteAsset={deleteAsset}
          navigateTo={setActiveItem}
        />
      </main>
    </div>
  );
};

export default Index;
