
import React from 'react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
  icon: React.ReactNode;
  label?: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
};

export const SidebarItem = ({
  icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}: SidebarItemProps) => {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "sidebar-item", 
        isActive ? "active" : "", 
        isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      {icon}
      {!isCollapsed && label && <span>{label}</span>}
    </button>
  );
};
