
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { exportToCSV } from "@/utils/export";
import { useInventory } from "@/hooks/useInventory";
import { toast } from "sonner";

export default function Inventory() {
  // Primitive state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  // Initialize with the useInventory hook
  const inventory = useInventory({
    searchQuery,
    categoryFilter: categoryFilter.join(','),
    statusFilter: statusFilter.join(','),
    supplierFilter,
    locationFilter
  });

  // Create wrapper functions to handle array vs string conversion
  const handleCategoryFilterChange = (categories: string[]) => {
    setCategoryFilter(categories);
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses);
  };

  const handleExport = useCallback(() => {
    try {
      // Only export filtered items
      const exportData = inventory.filteredItems.map(item => ({
        Name: item.name,
        SKU: item.sku,
        Category: item.category,
        Quantity: item.quantity,
        'Unit Price': item.unit_price,
        'Reorder Point': item.reorder_point,
        Supplier: item.supplier,
        Status: item.status,
        Location: item.location,
        'Last Updated': new Date(item.updated_at).toLocaleDateString()
      }));
      
      exportToCSV(exportData, `inventory-export-${new Date().toISOString().split('T')[0]}`);
      toast.success("Inventory exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export inventory");
    }
  }, [inventory.filteredItems]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild className="h-10">
            <Link to="/inventory/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      <InventoryStats 
        totalItems={inventory.items.length} 
        lowStockCount={inventory.lowStockCount}
        outOfStockCount={inventory.outOfStockCount}
        totalValue={inventory.totalValue}
      />
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-3/4">
          <InventorySearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="w-full lg:w-1/4 flex flex-row lg:flex-col gap-2">
          <InventoryFilters
            categories={inventory.categories}
            statuses={inventory.statuses}
            suppliers={inventory.suppliers}
            locations={inventory.locations}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            supplierFilter={supplierFilter}
            locationFilter={locationFilter}
            setCategoryFilter={handleCategoryFilterChange}
            setStatusFilter={handleStatusFilterChange}
            setSupplierFilter={setSupplierFilter}
            setLocationFilter={setLocationFilter}
          />
        </div>
      </div>
      
      <InventoryTable 
        items={inventory.filteredItems} 
        loading={inventory.loading} 
        error={inventory.error} 
      />
    </div>
  );
}
