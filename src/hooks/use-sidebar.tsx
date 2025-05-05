
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
  const [collapsed, setCollapsed] = React.useState(false);
  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);
  
  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Export useSidebarContext hook for components that need the context
export const useSidebarContext = () => useContext(SidebarContext);
