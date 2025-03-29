
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryAlerts } from "@/components/inventory/InventoryAlerts";
import { useInventoryFilters } from "@/hooks/useInventoryFilters";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { AutoReorderStatus } from "@/components/inventory/alerts/AutoReorderStatus";

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
  
  const { autoReorderSettings, lowStockItems, outOfStockItems } = useInventoryManager();

  return (
    <div className="space-y-6">
      <InventoryHeader />
      
      {/* Inventory Alerts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <InventoryAlerts />
        <AutoReorderStatus 
          items={[...lowStockItems, ...outOfStockItems]} 
          autoReorderSettings={autoReorderSettings} 
        />
      </div>

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
