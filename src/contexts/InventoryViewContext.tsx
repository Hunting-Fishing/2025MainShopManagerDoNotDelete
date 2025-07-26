import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewMode = 'cards' | 'grid' | 'list' | 'table';

interface InventoryViewState {
  viewMode: ViewMode;
  isFilterSidebarOpen: boolean;
  selectedItems: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface InventoryViewContextType extends InventoryViewState {
  setViewMode: (mode: ViewMode) => void;
  toggleFilterSidebar: () => void;
  setSelectedItems: (items: string[]) => void;
  toggleItemSelection: (itemId: string) => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  clearSelection: () => void;
}

const InventoryViewContext = createContext<InventoryViewContextType | undefined>(undefined);

export function InventoryViewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryViewState>({
    viewMode: 'table',
    isFilterSidebarOpen: false,
    selectedItems: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const setViewMode = (mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const toggleFilterSidebar = () => {
    setState(prev => ({ ...prev, isFilterSidebarOpen: !prev.isFilterSidebarOpen }));
  };

  const setSelectedItems = (items: string[]) => {
    setState(prev => ({ ...prev, selectedItems: items }));
  };

  const toggleItemSelection = (itemId: string) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId]
    }));
  };

  const setSorting = (sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const clearSelection = () => {
    setState(prev => ({ ...prev, selectedItems: [] }));
  };

  return (
    <InventoryViewContext.Provider
      value={{
        ...state,
        setViewMode,
        toggleFilterSidebar,
        setSelectedItems,
        toggleItemSelection,
        setSorting,
        clearSelection
      }}
    >
      {children}
    </InventoryViewContext.Provider>
  );
}

export function useInventoryView() {
  const context = useContext(InventoryViewContext);
  if (context === undefined) {
    throw new Error('useInventoryView must be used within an InventoryViewProvider');
  }
  return context;
}