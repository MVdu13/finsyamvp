
import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarLogo } from './sidebar/SidebarLogo';
import { SidebarItem } from './sidebar/SidebarItem';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SavingsSection } from './sidebar/SavingsSection';
import { InvestmentsSection } from './sidebar/InvestmentsSection';
import { ToolsSection } from './sidebar/ToolsSection';
import { MobileMenuButton } from './sidebar/MobileMenuButton';

type SidebarProps = {
  isCollapsed: boolean;
  activeItem: string;
  setActiveItem: (item: string) => void;
  toggleSidebar: () => void;
};

const AppSidebar = ({
  isCollapsed,
  activeItem,
  setActiveItem,
  toggleSidebar
}: SidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['savings', 'investments']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  const goToDashboard = () => {
    setActiveItem('dashboard');
  };

  return (
    <>
      {/* When sidebar is collapsed, show a menu button to reopen it */}
      {isCollapsed && <MobileMenuButton onClick={toggleSidebar} />}
    
      <div className={cn("h-screen fixed left-0 top-0 z-20 flex flex-col bg-white border-r border-border transition-all duration-300 ease-in-out shadow-sm", isCollapsed ? "w-[80px]" : "w-[280px]")}>
        <SidebarLogo 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar} 
          goToDashboard={goToDashboard} 
        />

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="space-y-2">
            {/* Dashboard - Main button */}
            <SidebarItem 
              icon={<LayoutDashboard size={22} />}
              label="Tableau de bord"
              isActive={activeItem === 'dashboard'}
              isCollapsed={isCollapsed}
              onClick={() => setActiveItem('dashboard')}
            />

            {/* Savings Section */}
            <SavingsSection
              isCollapsed={isCollapsed}
              activeItem={activeItem}
              isExpanded={isExpanded('savings')}
              toggleSection={() => toggleSection('savings')}
              setActiveItem={setActiveItem}
            />

            {/* Investments Section */}
            <InvestmentsSection
              isCollapsed={isCollapsed}
              activeItem={activeItem}
              isExpanded={isExpanded('investments')}
              toggleSection={() => toggleSection('investments')}
              setActiveItem={setActiveItem}
            />
            
            {/* Tools section */}
            <ToolsSection
              isCollapsed={isCollapsed}
              activeItem={activeItem}
              isExpanded={isExpanded('tools')}
              toggleSection={() => toggleSection('tools')}
              setActiveItem={setActiveItem}
            />
          </nav>
        </div>

        <SidebarFooter isCollapsed={isCollapsed} />
      </div>
    </>
  );
};

export default AppSidebar;
