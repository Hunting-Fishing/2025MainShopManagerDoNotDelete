
import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryPageHeader } from '@/components/inventory/InventoryPageHeader';
import { InventorySearch } from '@/components/inventory/InventorySearch';
import { InventoryFilterSection } from '@/components/inventory/InventoryFilterSection';
import { InventoryContent } from '@/components/inventory/InventoryContent';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';
import { InventorySeo } from '@/components/seo/InventorySeo';

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const {
    items,
    filteredItems,
    loading,
    error,
    categories,
    statuses,
    suppliers,
    locations,
    lowStockCount,
    outOfStockCount,
    totalValue,
    handleExport,
    refreshItems
  } = useInventory({
    searchQuery,
    categoryFilter: categoryFilter.join(','),
    statusFilter: statusFilter.join(','),
    supplierFilter,
    locationFilter
  });

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter('');
    setLocationFilter('');
  };

  const handleUpdateItem = async (id: string, updates: any) => {
    // This would typically call an update service
    // For now, refresh the items after update
    await refreshItems();
    return items.find(item => item.id === id) || items[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading inventory from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <InventoryPageHeader />
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading inventory: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <InventorySeo />
      <div className="space-y-6">
        <InventoryPageHeader />
        
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            All inventory data is live from your Supabase database. No mock or sample data is displayed.
          </AlertDescription>
        </Alert>

        <div className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>

          <div className="space-y-4">
            <InventorySearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <InventoryFilterSection
              categories={categories}
              statuses={statuses}
              suppliers={suppliers}
              locations={locations}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              supplierFilter={supplierFilter}
              locationFilter={locationFilter}
              setCategoryFilter={setCategoryFilter}
              setStatusFilter={setStatusFilter}
              setSupplierFilter={setSupplierFilter}
              setLocationFilter={setLocationFilter}
              onReset={resetFilters}
            />
          </div>
        </div>

        <InventoryContent 
          items={filteredItems}
          onUpdateItem={handleUpdateItem}
        />
      </div>
    </>
  );
}
