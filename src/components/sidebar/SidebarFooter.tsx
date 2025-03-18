
import React from 'react';
import { cn } from '@/lib/utils';
import { Settings, LogOut } from 'lucide-react';

type SidebarFooterProps = {
  isCollapsed: boolean;
};

export const SidebarFooter = ({
  isCollapsed,
}: SidebarFooterProps) => {
  return (
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
  );
};
