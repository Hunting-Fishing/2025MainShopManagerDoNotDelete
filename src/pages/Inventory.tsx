
import React from "react";
import { useInventoryFilters } from "@/hooks/inventory/useInventoryFilters";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryPageHeader } from "@/components/inventory/InventoryPageHeader";
import { InventoryFilterSection } from "@/components/inventory/InventoryFilterSection";
import { InventoryContent } from "@/components/inventory/InventoryContent";
import { InventoryLoadingState } from "@/components/inventory/InventoryLoadingState";
import { InventoryErrorState } from "@/components/inventory/InventoryErrorState";

const Inventory = () => {
  const {
    filteredItems,
    filters,
    updateFilter,
    resetFilters,
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
    error,
    categories,
    statuses,
    suppliers,
    locations
  } = useInventoryFilters();

  const inventoryCrud = useInventoryCrud();

  if (loading) {
    return <InventoryLoadingState />;
  }

  if (error) {
    return <InventoryErrorState error={error} />;
  }

  return (
    <div className="container mx-auto p-4">
      <InventoryPageHeader />

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

      <InventoryContent
        items={filteredItems}
        onUpdateItem={inventoryCrud.updateItem}
      />
    </div>
  );
};

export default Inventory;
