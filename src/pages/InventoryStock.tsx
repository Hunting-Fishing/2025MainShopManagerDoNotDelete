
import React from "react";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryStockHeader } from "@/components/inventory/InventoryStockHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { EmptyInventory } from "@/components/inventory/EmptyInventory";
import { useInventory } from "@/hooks/useInventory";
import { useInventoryFilters } from "@/hooks/inventory/useInventoryFilters";

export default function InventoryStock() {
  // Use inventory filters hook
  const filters = useInventoryFilters();
  
  // Pass the filters to the useInventory hook
  const inventory = useInventory({
    searchQuery: filters.searchQuery,
    categoryFilter: filters.categoryFilter.join(','),
    statusFilter: filters.statusFilter.join(','),
    supplierFilter: filters.supplierFilter,
    locationFilter: filters.locationFilter,
  });
  
  const {
    filteredItems,
    refreshItems,
    lowStockCount,
    outOfStockCount,
    totalValue,
    handleExport,
    error
  } = inventory;

  // Loading state
  if (filters.loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <InventoryHeader />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <InventoryHeader />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <InventoryHeader />
      
      <InventoryStockHeader 
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalValue={totalValue}
        onExport={handleExport}
        onRefresh={refreshItems}
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <InventorySearch 
              searchQuery={filters.searchQuery}
              setSearchQuery={filters.setSearchQuery}
            />
          </div>
          
          <InventoryFilters 
            categories={inventory.categories || []}
            statuses={inventory.statuses || []}
            suppliers={inventory.suppliers || []}
            locations={inventory.locations || []}
            categoryFilter={filters.categoryFilter}
            setCategoryFilter={filters.setCategoryFilter}
            statusFilter={filters.statusFilter}
            setStatusFilter={filters.setStatusFilter}
            supplierFilter={filters.supplierFilter}
            setSupplierFilter={filters.setSupplierFilter}
            locationFilter={filters.locationFilter}
            setLocationFilter={filters.setLocationFilter}
            onReset={filters.resetFilters}
          />
        </div>
        
        <div className="lg:w-3/4">
          {filteredItems.length === 0 ? (
            <EmptyInventory 
              searchQuery={filters.searchQuery}
              filtersActive={
                filters.categoryFilter.length > 0 || 
                filters.statusFilter.length > 0 || 
                filters.supplierFilter !== '' || 
                filters.locationFilter !== ''
              }
              onReset={filters.resetFilters}
            />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <InventoryTable items={filteredItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
