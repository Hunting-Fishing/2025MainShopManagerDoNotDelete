
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { InventoryPageHeader } from '@/components/inventory/InventoryPageHeader';
import { InventoryContent } from '@/components/inventory/InventoryContent';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryErrorState } from '@/components/inventory/InventoryErrorState';
import InventoryCreate from '@/pages/InventoryCreate';
import InventoryCategories from '@/pages/InventoryCategories';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryLocations from '@/pages/InventoryLocations';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryManager from '@/pages/InventoryManager';

/**
 * IMPORTANT: This page uses full inventory functionality
 * DO NOT replace with placeholder text - full functionality exists
 * Includes: inventory list, creation, categories, suppliers, locations, etc.
 */
export default function Inventory() {
  const { items, loading, error, updateItem } = useInventoryItems();

  return (
    <Routes>
      <Route path="/" element={
        <div className="p-6 space-y-6">
          <InventoryPageHeader />
          {loading ? (
            <InventoryLoadingState />
          ) : error ? (
            <InventoryErrorState error={error} />
          ) : (
            <InventoryContent items={items} onUpdateItem={updateItem} />
          )}
        </div>
      } />
      <Route path="/add" element={<InventoryCreate />} />
      <Route path="/categories" element={<InventoryCategories />} />
      <Route path="/suppliers" element={<InventorySuppliers />} />
      <Route path="/locations" element={<InventoryLocations />} />
      <Route path="/orders" element={<InventoryOrders />} />
      <Route path="/manager" element={<InventoryManager />} />
    </Routes>
  );
}
