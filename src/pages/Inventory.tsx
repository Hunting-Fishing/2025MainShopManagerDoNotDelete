
import React from "react";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryAlerts } from "@/components/inventory/InventoryAlerts";
import { useInventoryFilters } from "@/hooks/useInventoryFilters";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { AutoReorderStatus } from "@/components/inventory/alerts/AutoReorderStatus";
import { PendingOrdersCard } from "@/components/inventory/PendingOrdersCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Inventory() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    locationFilter,
    setLocationFilter,
    filteredItems,
    error,
    categories,
    statuses,
    suppliers,
    locations
  } = useInventoryFilters();
  
  const { autoReorderSettings, lowStockItems, outOfStockItems } = useInventoryManager();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] space-y-4">
        <div className="text-xl font-semibold text-red-500">Error loading inventory data</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InventoryHeader />
      
      {/* Inventory Alerts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <InventoryAlerts />
        </div>
        <PendingOrdersCard />
      </div>
      
      <AutoReorderStatus 
        items={[...lowStockItems, ...outOfStockItems]} 
        autoReorderSettings={autoReorderSettings} 
      />

      {/* Filters and search */}
      <InventoryFilters 
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
      />

      {/* Inventory Items table */}
      {filteredItems.length > 0 ? (
        <InventoryTable items={filteredItems} />
      ) : (
        <div className="flex justify-center items-center h-48 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No inventory items found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
