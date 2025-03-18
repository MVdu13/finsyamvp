
import React from 'react';
import { PiggyBank, Wallet, ScrollText, CreditCard, BarChart4 } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { SidebarSubItem } from './SidebarSubItem';

type SavingsSectionProps = {
  isCollapsed: boolean;
  activeItem: string;
  isExpanded: boolean;
  toggleSection: () => void;
  setActiveItem: (item: string) => void;
};

export const SavingsSection = ({
  isCollapsed,
  activeItem,
  isExpanded,
  toggleSection,
  setActiveItem,
}: SavingsSectionProps) => {
  if (isCollapsed) {
    return (
      <>
        <SidebarItem 
          icon={<Wallet size={22} />}
          isActive={activeItem === 'bank-accounts'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('bank-accounts')}
        />
        <SidebarItem 
          icon={<ScrollText size={22} />}
          isActive={activeItem === 'savings-accounts'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('savings-accounts')}
        />
        <SidebarItem 
          icon={<CreditCard size={22} />}
          isActive={activeItem === 'budget'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('budget')}
        />
        <SidebarItem 
          icon={<BarChart4 size={22} />}
          isActive={activeItem === 'projects'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveItem('projects')}
        />
      </>
    );
  }

  return (
    <SidebarSection
      title="Mon Épargne"
      icon={<PiggyBank size={22} />}
      isCollapsed={isCollapsed}
      isExpanded={isExpanded}
      toggleSection={toggleSection}
    >
      <SidebarSubItem 
        icon={<Wallet size={18} />}
        label="Comptes bancaires"
        isActive={activeItem === 'bank-accounts'}
        onClick={() => setActiveItem('bank-accounts')}
      />
      <SidebarSubItem 
        icon={<ScrollText size={18} />}
        label="Livrets"
        isActive={activeItem === 'savings-accounts'}
        onClick={() => setActiveItem('savings-accounts')}
      />
      <SidebarSubItem 
        icon={<CreditCard size={18} />}
        label="Budget"
        isActive={activeItem === 'budget'}
        onClick={() => setActiveItem('budget')}
      />
      <SidebarSubItem 
        icon={<BarChart4 size={18} />}
        label="Projets financiers"
        isActive={activeItem === 'projects'}
        onClick={() => setActiveItem('projects')}
      />
    </SidebarSection>
  );
};
