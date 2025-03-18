
import React, { ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

type SidebarSectionProps = {
  title: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  isExpanded: boolean;
  toggleSection: () => void;
  children: ReactNode;
};

export const SidebarSection = ({
  title,
  icon,
  isCollapsed,
  isExpanded,
  toggleSection,
  children,
}: SidebarSectionProps) => {
  if (isCollapsed) {
    return (
      <>{children}</>
    );
  }
  
  return (
    <Collapsible open={isExpanded} onOpenChange={toggleSection}>
      <CollapsibleTrigger className="w-full sidebar-item">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-7 space-y-1 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
