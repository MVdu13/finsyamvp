
import React from 'react';
import { cn } from '@/lib/utils';

type SidebarSubItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

export const SidebarSubItem = ({
  icon,
  label,
  isActive,
  onClick,
}: SidebarSubItemProps) => {
  return (
    <button 
      onClick={onClick} 
      className={cn("sidebar-subitem", isActive ? "active" : "")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
