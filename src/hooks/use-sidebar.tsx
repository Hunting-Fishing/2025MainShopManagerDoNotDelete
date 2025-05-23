
import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  collapsed: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggleCollapse = () => setCollapsed(!collapsed);

  return (
    <SidebarContext.Provider value={{ isOpen, collapsed, onOpen, onClose, onToggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}

export { SidebarContext };
