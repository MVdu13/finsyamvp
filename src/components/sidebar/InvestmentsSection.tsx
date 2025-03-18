
import React from 'react';
import { CircleDollarSign, Building2, Briefcase, Bitcoin } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { SidebarSubItem } from './SidebarSubItem';

type InvestmentsSectionProps = {
  isCollapsed: boolean;
  activeItem: string;
  isExpanded: boolean;
  toggleSection: () => void;
  setActiveItem: (item: string) => void;
};

export const InvestmentsSection = ({
  isCollapsed,
  activeItem,
  isExpanded,
  toggleSection,
  setActiveItem,
}: InvestmentsSectionProps) => {
  if (isCollapsed) {
    return (
      <>
        <SidebarItem 
          icon={<CircleDollarSign size={22} />}
          isActive={activeItem === 'assets'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('assets')}
        />
        <SidebarItem 
          icon={<Building2 size={22} />}
          isActive={activeItem === 'real-estate'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('real-estate')}
        />
        <SidebarItem 
          icon={<Briefcase size={22} />}
          isActive={activeItem === 'stocks'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('stocks')}
        />
        <SidebarItem 
          icon={<Bitcoin size={22} />}
          isActive={activeItem === 'crypto'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('crypto')}
        />
      </>
    );
  }

  return (
    <SidebarSection
      title="Placements financiers"
      icon={<CircleDollarSign size={22} />}
      isCollapsed={isCollapsed}
      isExpanded={isExpanded}
      toggleSection={toggleSection}
    >
      <SidebarSubItem 
        icon={<CircleDollarSign size={18} />}
        label="Tous les actifs"
        isActive={activeItem === 'assets'}
        onClick={() => setActiveItem('assets')}
      />
      <SidebarSubItem 
        icon={<Building2 size={18} />}
        label="Immobilier"
        isActive={activeItem === 'real-estate'}
        onClick={() => setActiveItem('real-estate')}
      />
      <SidebarSubItem 
        icon={<Briefcase size={18} />}
        label="Actions et ETF"
        isActive={activeItem === 'stocks'}
        onClick={() => setActiveItem('stocks')}
      />
      <SidebarSubItem 
        icon={<Bitcoin size={18} />}
        label="Cryptomonnaies"
        isActive={activeItem === 'crypto'}
        onClick={() => setActiveItem('crypto')}
      />
    </SidebarSection>
  );
};
