
import { useState, useEffect } from 'react';

export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    const sidebarState = localStorage.getItem('sidebar-collapsed');
    if (sidebarState) {
      setIsCollapsed(sidebarState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return {
    isCollapsed,
    activeItem,
    setActiveItem,
    toggleSidebar
  };
};
