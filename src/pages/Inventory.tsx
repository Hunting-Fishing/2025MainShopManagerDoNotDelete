
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryAlerts } from "@/components/inventory/InventoryAlerts";
import { useInventoryFilters } from "@/hooks/useInventoryFilters";

export default function Inventory() {
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    filteredItems,
  } = useInventoryFilters();

  return (
    <div className="space-y-6">
      <InventoryHeader />
      
      {/* Add the Inventory Alerts component */}
      <InventoryAlerts />

      {/* Filters and search */}
      <InventoryFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
      />

      {/* Inventory Items table */}
      <InventoryTable items={filteredItems} />
    </div>
  );
}
