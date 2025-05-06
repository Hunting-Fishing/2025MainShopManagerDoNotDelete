
import React, { useState, useEffect } from "react";
import { useInventoryFilters } from "@/hooks/useInventoryFilters";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AdvancedSearchFilter, ColumnVisibility } from "@/components/inventory/AdvancedSearchFilter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, BarChart4, Download, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { InventoryItemExtended } from "@/types/inventory";

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

  // Additional filter states for advanced search
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [quantityRange, setQuantityRange] = useState<[number | null, number | null]>([null, null]);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [displayItems, setDisplayItems] = useState<InventoryItemExtended[]>([]);
  const [columns, setColumns] = useState<ColumnVisibility[]>([]);

  // Initialize column visibility from InventoryTable columns
  useEffect(() => {
    if (inventoryItems.length > 0) {
      const initialColumns: ColumnVisibility[] = [
        { id: "partNumber", header: "Part #", show: true },
        { id: "name", header: "Item Name", show: true },
        { id: "sku", header: "SKU", show: true },
        { id: "barcode", header: "Barcode", show: true },
        { id: "category", header: "Category", show: true },
        { id: "subcategory", header: "Subcategory", show: false },
        { id: "manufacturer", header: "Brand / Manufacturer", show: true },
        { id: "vehicleCompatibility", header: "Vehicle Compatibility", show: false },
        { id: "location", header: "Location", show: true },
        { id: "quantity", header: "Qty In Stock", show: true },
        { id: "onHold", header: "Qty Reserved", show: true },
        { id: "available", header: "Qty Available", show: true },
        { id: "onOrder", header: "Qty on Order", show: true },
        { id: "reorderPoint", header: "Reorder Level", show: true },
        { id: "cost", header: "Unit Cost", show: true },
        { id: "unitPrice", header: "Unit Price", show: true },
        { id: "markup", header: "Markup %", show: true },
        { id: "totalValue", header: "Total Value", show: true },
        { id: "warrantyPeriod", header: "Warranty Period", show: false },
        { id: "status", header: "Status", show: true },
        { id: "supplier", header: "Supplier", show: true },
        { id: "dateBought", header: "Last Ordered", show: true },
        { id: "dateLast", header: "Last Used", show: true },
        { id: "notes", header: "Notes", show: false },
        { id: "actions", header: "Actions", show: true },
      ];
      setColumns(initialColumns);
    }
  }, [inventoryItems]);

  // Apply filters to displayItems
  useEffect(() => {
    let result = [...filteredItems];
    
    // Apply price range filter
    if (priceRange[0] !== null || priceRange[1] !== null) {
      result = result.filter(item => {
        const price = item.unitPrice;
        if (priceRange[0] !== null && priceRange[1] !== null) {
          return price >= priceRange[0] && price <= priceRange[1];
        } else if (priceRange[0] !== null) {
          return price >= priceRange[0];
        } else if (priceRange[1] !== null) {
          return price <= priceRange[1];
        }
        return true;
      });
    }
    
    // Apply quantity range filter
    if (quantityRange[0] !== null || quantityRange[1] !== null) {
      result = result.filter(item => {
        const quantity = item.quantity;
        if (quantityRange[0] !== null && quantityRange[1] !== null) {
          return quantity >= quantityRange[0] && quantity <= quantityRange[1];
        } else if (quantityRange[0] !== null) {
          return quantity >= quantityRange[0];
        } else if (quantityRange[1] !== null) {
          return quantity <= quantityRange[1];
        }
        return true;
      });
    }
    
    // Apply date range filter (for last ordered date)
    if (dateRange[0] !== null || dateRange[1] !== null) {
      result = result.filter(item => {
        if (!item.dateBought) return false;
        
        const itemDate = new Date(item.dateBought).getTime();
        const startDate = dateRange[0] ? new Date(dateRange[0]).getTime() : null;
        const endDate = dateRange[1] ? new Date(dateRange[1]).getTime() : null;
        
        if (startDate !== null && endDate !== null) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate !== null) {
          return itemDate >= startDate;
        } else if (endDate !== null) {
          return itemDate <= endDate;
        }
        return true;
      });
    }
    
    setDisplayItems(result);
  }, [filteredItems, priceRange, quantityRange, dateRange]);

  const handleSearch = () => {
    // This will trigger the useEffect above by relying on the dependency array
    // The advanced filters are already applied in the useEffect
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter("all");
    setLocationFilter("all");
    setPriceRange([null, null]);
    setQuantityRange([null, null]);
    setDateRange([null, null]);
  };

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
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1 rounded-full"
                  onClick={handleImport}
                >
                  <Upload className="h-4 w-4" />
                  Import
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

          <AdvancedSearchFilter
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
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            quantityRange={quantityRange}
            setQuantityRange={setQuantityRange}
            dateRange={dateRange}
            setDateRange={setDateRange}
            categories={categories}
            statuses={statuses}
            suppliers={suppliers}
            locations={locations}
            columns={columns}
            setColumns={setColumns}
            onSearch={handleSearch}
            onClearAll={handleClearAllFilters}
          />

          <div className="mt-4 overflow-hidden">
            <InventoryTable items={displayItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
