
import React, { useState } from 'react';
import { LayoutDashboard, CircleDollarSign, PiggyBank, Building2, Briefcase, Bitcoin, CreditCard, BarChart4, Settings, ChevronLeft, LogOut, ChevronDown, ChevronRight, Wallet, ScrollText, Menu, Calculator, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

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
      {isCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="fixed left-[16px] top-4 z-30 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}
    
      <div className={cn("h-screen fixed left-0 top-0 z-20 flex flex-col bg-white border-r border-border transition-all duration-300 ease-in-out shadow-sm", isCollapsed ? "w-[80px]" : "w-[280px]")}>
        <div className="flex items-center p-4 border-b border-border">
          <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "justify-between w-full")}>
            {!isCollapsed && <div className="flex items-center">
                <img 
                  src="/lovable-uploads/2c91a9cb-b596-4e15-bc10-1c8160645288.png" 
                  alt="Finsya Logo" 
                  className="h-8 cursor-pointer" 
                  onClick={goToDashboard}
                />
              </div>}
            {isCollapsed && <img 
              src="/lovable-uploads/2c91a9cb-b596-4e15-bc10-1c8160645288.png" 
              alt="Finsya Logo" 
              className="h-7 w-auto cursor-pointer" 
              onClick={goToDashboard}
            />}
            <button onClick={toggleSidebar} className={cn("p-1 rounded-full hover:bg-muted transition-colors", isCollapsed ? "hidden" : "flex")}>
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="space-y-2">
            {/* Dashboard - Main button */}
            <button 
              onClick={() => setActiveItem('dashboard')} 
              className={cn("sidebar-item", activeItem === 'dashboard' ? "active" : "", isCollapsed ? "justify-center" : "justify-start")}
            >
              <LayoutDashboard size={22} />
              {!isCollapsed && <span>Tableau de bord</span>}
            </button>

            {/* Savings Section - Collapsible */}
            {!isCollapsed ? (
              <Collapsible open={isExpanded('savings')} onOpenChange={() => toggleSection('savings')}>
                <CollapsibleTrigger className="w-full sidebar-item">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <PiggyBank size={22} />
                      <span>Mon Épargne</span>
                    </div>
                    {isExpanded('savings') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-7 space-y-1 mt-1">
                  <button 
                    onClick={() => setActiveItem('bank-accounts')} 
                    className={cn("sidebar-subitem", activeItem === 'bank-accounts' ? "active" : "")}
                  >
                    <Wallet size={18} />
                    <span>Comptes bancaires</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('savings-accounts')} 
                    className={cn("sidebar-subitem", activeItem === 'savings-accounts' ? "active" : "")}
                  >
                    <ScrollText size={18} />
                    <span>Livrets</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('budget')} 
                    className={cn("sidebar-subitem", activeItem === 'budget' ? "active" : "")}
                  >
                    <CreditCard size={18} />
                    <span>Budget</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('projects')} 
                    className={cn("sidebar-subitem", activeItem === 'projects' ? "active" : "")}
                  >
                    <BarChart4 size={18} />
                    <span>Projets financiers</span>
                  </button>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <button 
                  onClick={() => setActiveItem('bank-accounts')} 
                  className={cn("sidebar-item", activeItem === 'bank-accounts' ? "active" : "", "justify-center")}
                >
                  <Wallet size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('savings-accounts')} 
                  className={cn("sidebar-item", activeItem === 'savings-accounts' ? "active" : "", "justify-center")}
                >
                  <ScrollText size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('budget')} 
                  className={cn("sidebar-item", activeItem === 'budget' ? "active" : "", "justify-center")}
                >
                  <CreditCard size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('projects')} 
                  className={cn("sidebar-item", activeItem === 'projects' ? "active" : "", "justify-center")}
                >
                  <BarChart4 size={22} />
                </button>
              </>
            )}

            {/* Investments Section - Collapsible */}
            {!isCollapsed ? (
              <Collapsible open={isExpanded('investments')} onOpenChange={() => toggleSection('investments')}>
                <CollapsibleTrigger className="w-full sidebar-item">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign size={22} />
                      <span>Placements financiers</span>
                    </div>
                    {isExpanded('investments') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-7 space-y-1 mt-1">
                  <button 
                    onClick={() => setActiveItem('assets')} 
                    className={cn("sidebar-subitem", activeItem === 'assets' ? "active" : "")}
                  >
                    <CircleDollarSign size={18} />
                    <span>Tous les actifs</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('real-estate')} 
                    className={cn("sidebar-subitem", activeItem === 'real-estate' ? "active" : "")}
                  >
                    <Building2 size={18} />
                    <span>Immobilier</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('stocks')} 
                    className={cn("sidebar-subitem", activeItem === 'stocks' ? "active" : "")}
                  >
                    <Briefcase size={18} />
                    <span>Actions et ETF</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('crypto')} 
                    className={cn("sidebar-subitem", activeItem === 'crypto' ? "active" : "")}
                  >
                    <Bitcoin size={18} />
                    <span>Cryptomonnaies</span>
                  </button>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <button 
                  onClick={() => setActiveItem('assets')} 
                  className={cn("sidebar-item", activeItem === 'assets' ? "active" : "", "justify-center")}
                >
                  <CircleDollarSign size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('real-estate')} 
                  className={cn("sidebar-item", activeItem === 'real-estate' ? "active" : "", "justify-center")}
                >
                  <Building2 size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('stocks')} 
                  className={cn("sidebar-item", activeItem === 'stocks' ? "active" : "", "justify-center")}
                >
                  <Briefcase size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('crypto')} 
                  className={cn("sidebar-item", activeItem === 'crypto' ? "active" : "", "justify-center")}
                >
                  <Bitcoin size={22} />
                </button>
              </>
            )}
            
            {/* Tools section - New */}
            {!isCollapsed ? (
              <Collapsible open={isExpanded('tools')} onOpenChange={() => toggleSection('tools')}>
                <CollapsibleTrigger className="w-full sidebar-item">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Calculator size={22} />
                      <span>Outils</span>
                    </div>
                    {isExpanded('tools') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-7 space-y-1 mt-1">
                  <button 
                    onClick={() => setActiveItem('compound-interest')} 
                    className={cn("sidebar-subitem", activeItem === 'compound-interest' ? "active" : "")}
                  >
                    <TrendingUp size={18} />
                    <span>Intérêt Composés</span>
                  </button>
                  <button 
                    onClick={() => setActiveItem('credit-simulator')} 
                    className={cn("sidebar-subitem", activeItem === 'credit-simulator' ? "active" : "")}
                  >
                    <Calculator size={18} />
                    <span>Simulateur de Crédit</span>
                  </button>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <button 
                  onClick={() => setActiveItem('compound-interest')} 
                  className={cn("sidebar-item", activeItem === 'compound-interest' ? "active" : "", "justify-center")}
                >
                  <TrendingUp size={22} />
                </button>
                <button 
                  onClick={() => setActiveItem('credit-simulator')} 
                  className={cn("sidebar-item", activeItem === 'credit-simulator' ? "active" : "", "justify-center")}
                >
                  <Calculator size={22} />
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <button className={cn("sidebar-item", isCollapsed ? "justify-center" : "justify-start")}>
              <Settings size={22} />
              {!isCollapsed && <span>Paramètres</span>}
            </button>
            <button className={cn("sidebar-item text-red-500 hover:bg-red-50", isCollapsed ? "justify-center" : "justify-start")}>
              <LogOut size={22} />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
