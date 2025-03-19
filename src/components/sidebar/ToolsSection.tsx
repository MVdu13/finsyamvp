
import React from 'react';
import { Calculator, TrendingUp, RefreshCw } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { SidebarSubItem } from './SidebarSubItem';

type ToolsSectionProps = {
  isCollapsed: boolean;
  activeItem: string;
  isExpanded: boolean;
  toggleSection: () => void;
  setActiveItem: (item: string) => void;
};

export const ToolsSection = ({
  isCollapsed,
  activeItem,
  isExpanded,
  toggleSection,
  setActiveItem,
}: ToolsSectionProps) => {
  if (isCollapsed) {
    return (
      <>
        <SidebarItem 
          icon={<TrendingUp size={22} />}
          isActive={activeItem === 'compound-interest'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('compound-interest')}
        />
        <SidebarItem 
          icon={<Calculator size={22} />}
          isActive={activeItem === 'credit-simulator'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('credit-simulator')}
        />
        <SidebarItem 
          icon={<RefreshCw size={22} />}
          isActive={activeItem === 'portfolio-rebalancer'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('portfolio-rebalancer')}
        />
      </>
    );
  }

  return (
    <SidebarSection
      title="Outils"
      icon={<Calculator size={22} />}
      isCollapsed={isCollapsed}
      isExpanded={isExpanded}
      toggleSection={toggleSection}
    >
      <SidebarSubItem 
        icon={<TrendingUp size={18} />}
        label="Intérêt Composés"
        isActive={activeItem === 'compound-interest'}
        onClick={() => setActiveItem('compound-interest')}
      />
      <SidebarSubItem 
        icon={<Calculator size={18} />}
        label="Simulateur de Crédit"
        isActive={activeItem === 'credit-simulator'}
        onClick={() => setActiveItem('credit-simulator')}
      />
      <SidebarSubItem 
        icon={<RefreshCw size={18} />}
        label="Rebalancement"
        isActive={activeItem === 'portfolio-rebalancer'}
        onClick={() => setActiveItem('portfolio-rebalancer')}
      />
    </SidebarSection>
  );
};
