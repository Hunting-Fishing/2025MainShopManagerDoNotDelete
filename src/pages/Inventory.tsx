
import React from 'react';
import { InventoryPageHeader } from '@/components/inventory/InventoryPageHeader';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryErrorState } from '@/components/inventory/InventoryErrorState';
import { InventoryContent } from '@/components/inventory/InventoryContent';
import { InventoryFilterSection } from '@/components/inventory/InventoryFilterSection';
import { InventorySearch } from '@/components/inventory/InventorySearch';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useInventoryCrud } from '@/hooks/inventory/useInventoryCrud';
import { useState, useMemo } from 'react';
import { InventoryItemExtended } from '@/types/inventory';

export default function Inventory() {
  const { items, isLoading, fetchItems } = useInventoryItems();
  const { updateItem } = useInventoryCrud();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Get unique values for filters
  const categories = useMemo(() => 
    [...new Set(items.map(item => item.category).filter(Boolean))], [items]
  );
  const statuses = useMemo(() => 
    [...new Set(items.map(item => item.status).filter(Boolean))], [items]
  );
  const suppliers = useMemo(() => 
    [...new Set(items.map(item => item.supplier).filter(Boolean))], [items]
  );
  const locations = useMemo(() => 
    [...new Set(items.map(item => item.location).filter(Boolean))], [items]
  );

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter.length === 0 || 
        (item.category && categoryFilter.includes(item.category));
      
      const matchesStatus = statusFilter.length === 0 || 
        (item.status && statusFilter.includes(item.status));
      
      const matchesSupplier = !supplierFilter || item.supplier === supplierFilter;
      
      const matchesLocation = !locationFilter || item.location === locationFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier && matchesLocation;
    });
  }, [items, searchQuery, categoryFilter, statusFilter, supplierFilter, locationFilter]);

  // Calculate stats
  const totalItems = items.length;
  const lowStockCount = items.filter(item => 
    item.quantity > 0 && item.quantity <= (item.reorder_point || 10)
  ).length;
  const outOfStockCount = items.filter(item => item.quantity === 0).length;
  const totalValue = items.reduce((sum, item) => 
    sum + (item.quantity * (item.unit_price || item.price || 0)), 0
  );

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItemExtended>) => {
    const updatedItem = await updateItem(id, updates);
    await fetchItems(); // Refresh the list
    return updatedItem;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter('');
    setLocationFilter('');
  };

  if (isLoading) {
    return <InventoryLoadingState />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <InventoryPageHeader />
      
      <InventoryStats
        totalItems={totalItems}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalValue={totalValue}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
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
            onReset={handleResetFilters}
          />
        </div>

        <div className="lg:w-3/4 space-y-4">
          <InventorySearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <InventoryContent
            items={filteredItems}
            onUpdateItem={handleUpdateItem}
          />
        </div>
      </div>
    </div>
  );
}
