
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

type SidebarLogoProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  goToDashboard: () => void;
};

export const SidebarLogo = ({
  isCollapsed,
  toggleSidebar,
  goToDashboard,
}: SidebarLogoProps) => {
  return (
    <div className="flex items-center p-4 border-b border-border">
      <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "justify-between w-full")}>
        {!isCollapsed ? (
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/2c91a9cb-b596-4e15-bc10-1c8160645288.png" 
              alt="Finsya Logo" 
              className="h-8 cursor-pointer" 
              onClick={goToDashboard}
            />
          </div>
        ) : null}
        <button onClick={toggleSidebar} className={cn("p-1 rounded-full hover:bg-muted transition-colors", isCollapsed ? "hidden" : "flex")}>
          <ChevronLeft size={20} />
        </button>
      </div>
    </div>
  );
};
