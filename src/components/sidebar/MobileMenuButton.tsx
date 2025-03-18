
import React from 'react';
import { Menu } from 'lucide-react';

type MobileMenuButtonProps = {
  onClick: () => void;
};

export const MobileMenuButton = ({ onClick }: MobileMenuButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className="fixed left-[16px] top-4 z-30 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
      aria-label="Open sidebar"
    >
      <Menu size={18} />
    </button>
  );
};
