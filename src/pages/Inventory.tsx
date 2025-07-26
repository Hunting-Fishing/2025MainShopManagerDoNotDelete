
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { InventoryPageHeader } from '@/components/inventory/InventoryPageHeader';
import { InventoryContent } from '@/components/inventory/InventoryContent';
import { useOptimizedInventoryItems } from '@/hooks/inventory/useOptimizedInventoryItems';
import { useOptimizedInventoryFilters } from '@/hooks/inventory/useOptimizedInventoryFilters';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryErrorState } from '@/components/inventory/InventoryErrorState';
import { InventoryViewProvider } from '@/contexts/InventoryViewContext';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryCategories from '@/pages/InventoryCategories';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryLocations from '@/pages/InventoryLocations';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryManager from '@/pages/InventoryManager';
import InventoryItemDetailsPage from '@/pages/InventoryItemDetails';

/**
 * IMPORTANT: This page uses optimized inventory functionality with centralized data management
 * Performance optimizations: consolidated data fetching, memoization, efficient caching
 * Includes: inventory list, creation, categories, suppliers, locations, etc.
 */
export default function Inventory() {
  const { items, loading, error, updateItem } = useOptimizedInventoryItems();
  const { filteredItems } = useOptimizedInventoryFilters();

  // Use filtered items if available, otherwise use all items
  const displayItems = filteredItems.length > 0 || items.length === 0 ? filteredItems : items;

  return (
    <InventoryViewProvider>
      <Routes>
        <Route path="/" element={
          <div className="p-6 space-y-6">
            <InventoryPageHeader />
            {loading ? (
              <InventoryLoadingState />
            ) : error ? (
              <InventoryErrorState error={error} />
            ) : (
              <InventoryContent items={displayItems} onUpdateItem={updateItem} />
            )}
          </div>
        } />
        <Route path="/add" element={<InventoryAdd />} />
        <Route path="/categories" element={<InventoryCategories />} />
        <Route path="/suppliers" element={<InventorySuppliers />} />
        <Route path="/locations" element={<InventoryLocations />} />
        <Route path="/orders" element={<InventoryOrders />} />
        <Route path="/manager" element={<InventoryManager />} />
        <Route path="/item/:id" element={<InventoryItemDetailsPage />} />
      </Routes>
    </InventoryViewProvider>
  );
}
