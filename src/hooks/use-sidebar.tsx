
import { create } from 'zustand';
import React, { createContext, useContext, ReactNode } from 'react';

interface SidebarState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

// Create a context to use in the SidebarProvider
const SidebarContext = createContext<{ collapsed: boolean; toggleCollapsed: () => void }>({
  collapsed: false,
  toggleCollapsed: () => {},
});

// Export SidebarProvider component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const { isOpen, toggle } = useSidebar();
  
  return (
    <SidebarContext.Provider value={{ collapsed: !isOpen, toggleCollapsed: toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Export useSidebarContext hook for components that need the legacy interface
export const useSidebarContext = () => useContext(SidebarContext);
