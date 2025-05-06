
import React from "react";
import { useInventoryFilters } from "@/hooks/useInventoryFilters";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryFiltersBar } from "@/components/inventory/InventoryFiltersBar";
import { InventoryItemsTable } from "@/components/inventory/InventoryItemsTable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, BarChart4 } from "lucide-react";
import { Link } from "react-router-dom";

export default function InventoryStock() {
  const {
    inventoryItems,
    loading,
    error,
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
    categories,
    statuses,
    suppliers,
    locations,
    handleExport,
    handleImport
  } = useInventoryFilters();

  const handleRefresh = () => {
    window.location.reload();
  };

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
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Inventory Summary</h2>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  className="flex items-center gap-1 rounded-full"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1 rounded-full"
                  asChild
                >
                  <Link to="/inventory/reports">
                    <BarChart4 className="h-4 w-4" />
                    Reports
                  </Link>
                </Button>
                <Button 
                  asChild 
                  className="flex items-center gap-1 rounded-full text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Link to="/inventory/add">
                    <PlusCircle className="h-4 w-4" />
                    Add Item
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="text-blue-600 text-sm font-medium">Total Items</div>
                <div className="text-2xl font-bold mt-1">{inventoryItems.length}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="text-green-600 text-sm font-medium">In Stock</div>
                <div className="text-2xl font-bold mt-1">
                  {inventoryItems.filter(item => item.status === "In Stock").length}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="text-yellow-600 text-sm font-medium">Low Stock</div>
                <div className="text-2xl font-bold mt-1">
                  {inventoryItems.filter(item => item.status === "Low Stock").length}
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="text-red-600 text-sm font-medium">Out of Stock</div>
                <div className="text-2xl font-bold mt-1">
                  {inventoryItems.filter(item => item.status === "Out of Stock").length}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div className="text-purple-600 text-sm font-medium">Total Value</div>
                <div className="text-2xl font-bold mt-1">
                  ${inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <InventoryFiltersBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            supplierFilter={supplierFilter}
            setSupplierFilter={setSupplierFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            categories={categories}
            statuses={statuses}
            suppliers={suppliers}
            locations={locations}
            handleExport={handleExport}
            handleImport={handleImport}
          />

          <div className="mt-4">
            <InventoryItemsTable items={filteredItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
