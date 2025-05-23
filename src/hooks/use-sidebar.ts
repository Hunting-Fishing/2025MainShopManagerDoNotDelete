
import { createContext, useContext } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
