
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
  
  console.log('Inventory page: Received items:', items);
  console.log('Inventory page: Items count:', items.length);
  console.log('Inventory page: Loading state:', isLoading);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Get unique values for filters
  const categories = useMemo(() => {
    const cats = [...new Set(items.map(item => item.category).filter(Boolean))];
    console.log('Available categories:', cats);
    return cats;
  }, [items]);
  
  const statuses = useMemo(() => {
    const stats = [...new Set(items.map(item => item.status).filter(Boolean))];
    console.log('Available statuses:', stats);
    return stats;
  }, [items]);
  
  const suppliers = useMemo(() => {
    const sups = [...new Set(items.map(item => item.supplier).filter(Boolean))];
    console.log('Available suppliers:', sups);
    return sups;
  }, [items]);
  
  const locations = useMemo(() => {
    const locs = [...new Set(items.map(item => item.location).filter(Boolean))];
    console.log('Available locations:', locs);
    return locs;
  }, [items]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    console.log('Filtering items. Total items before filtering:', items.length);
    console.log('Filter criteria:', {
      searchQuery,
      categoryFilter,
      statusFilter,
      supplierFilter,
      locationFilter
    });
    
    const filtered = items.filter(item => {
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

      const passes = matchesSearch && matchesCategory && matchesStatus && matchesSupplier && matchesLocation;
      
      if (!passes) {
        console.log('Item filtered out:', item.name, {
          matchesSearch,
          matchesCategory,
          matchesStatus,
          matchesSupplier,
          matchesLocation
        });
      }
      
      return passes;
    });
    
    console.log('Filtered items count:', filtered.length);
    console.log('Filtered items:', filtered);
    return filtered;
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

  console.log('Inventory stats:', {
    totalItems,
    lowStockCount,
    outOfStockCount,
    totalValue
  });

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
