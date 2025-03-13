import React from 'react';
import { LayoutDashboard, CircleDollarSign, GalleryHorizontalEnd, Building2, Briefcase, Bitcoin, CreditCard, BarChart3, PiggyBank, Settings, ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
type SidebarProps = {
  isCollapsed: boolean;
  activeItem: string;
  setActiveItem: (item: string) => void;
  toggleSidebar: () => void;
};
const sidebarItems = [{
  id: 'dashboard',
  label: 'Tableau de bord',
  icon: LayoutDashboard
}, {
  id: 'assets',
  label: 'Actifs financiers',
  icon: CircleDollarSign
}, {
  id: 'portfolios',
  label: 'Portefeuilles',
  icon: GalleryHorizontalEnd
}, {
  id: 'real-estate',
  label: 'Immobilier',
  icon: Building2
}, {
  id: 'stocks',
  label: 'Actions',
  icon: Briefcase
}, {
  id: 'crypto',
  label: 'Cryptomonnaies',
  icon: Bitcoin
}, {
  id: 'budget',
  label: 'Budget',
  icon: CreditCard
}, {
  id: 'analytics',
  label: 'Analyse',
  icon: BarChart3
}, {
  id: 'savings',
  label: 'Épargne',
  icon: PiggyBank
}];
const AppSidebar = ({
  isCollapsed,
  activeItem,
  setActiveItem,
  toggleSidebar
}: SidebarProps) => {
  return <div className={cn("h-screen fixed left-0 top-0 z-20 flex flex-col bg-white border-r border-border transition-all duration-300 ease-in-out shadow-sm", isCollapsed ? "w-[80px]" : "w-[280px]")}>
      <div className="flex items-center p-4 border-b border-border">
        <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "justify-between w-full")}>
          {!isCollapsed && <div className="flex items-center gap-2">
              <img src="/lovable-uploads/e06c645b-581b-493b-b7fa-a7b9d6fdcd5c.png" alt="Logo" className="h-8 w-8" />
              <span className="font-semibold text-lg">Finsya
          </span>
            </div>}
          {isCollapsed && <img src="/lovable-uploads/e06c645b-581b-493b-b7fa-a7b9d6fdcd5c.png" alt="Logo" className="h-10 w-10" />}
          <button onClick={toggleSidebar} className={cn("p-1 rounded-full hover:bg-muted transition-colors", isCollapsed ? "hidden" : "flex")}>
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-2">
          {sidebarItems.map(item => <button key={item.id} onClick={() => setActiveItem(item.id)} className={cn("sidebar-item", activeItem === item.id ? "active" : "", isCollapsed ? "justify-center" : "justify-start")}>
              <item.icon size={22} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>)}
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
    </div>;
};
export default AppSidebar;