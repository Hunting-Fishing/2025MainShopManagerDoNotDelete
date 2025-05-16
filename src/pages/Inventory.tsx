
import React from "react";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { EmptyInventory } from "@/components/inventory/EmptyInventory";
import { InventoryStockHeader } from "@/components/inventory/InventoryStockHeader";
import { useInventoryFilters } from "@/hooks/inventory/useInventoryFilters";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-80">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">Error loading inventory: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <InventoryStockHeader
        title="Inventory Management"
        description="Manage your inventory items, track stock levels, and view inventory metrics."
        showControls={true}
        onExport={() => console.log("Export inventory")}
        onImport={() => console.log("Import inventory")}
      />

      <div className="mb-6">
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
          onReset={resetFilters}
        />
      </div>

      {filteredItems.length > 0 ? (
        <InventoryTable items={filteredItems} onUpdateItem={inventoryCrud.updateItem} />
      ) : (
        <EmptyInventory />
      )}
    </div>
  );
};

export default Inventory;
