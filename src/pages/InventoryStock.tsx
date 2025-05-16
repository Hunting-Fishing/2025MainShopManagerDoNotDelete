
import React from "react";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useInventoryFilters } from "@/hooks/useInventoryFilters";

export default function InventoryStock() {
  const {
    loading,
    filteredItems,
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
    categories,
    statuses,
    suppliers,
    locations,
    handleExport,
    handleImport
  } = useInventoryFilters();

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
      <InventoryHeader 
        title="Inventory Stock" 
        description="View and manage your inventory stock levels"
        showControls={true}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Filters */}
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

      {/* Stock Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3 text-left font-medium text-sm">Item</th>
              <th className="p-3 text-left font-medium text-sm">SKU</th>
              <th className="p-3 text-left font-medium text-sm">Category</th>
              <th className="p-3 text-right font-medium text-sm">Current Stock</th>
              <th className="p-3 text-right font-medium text-sm">Reorder Point</th>
              <th className="p-3 text-right font-medium text-sm">Price</th>
              <th className="p-3 text-center font-medium text-sm">Status</th>
              <th className="p-3 text-center font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </td>
                <td className="p-3 text-sm">{item.sku}</td>
                <td className="p-3 text-sm">{item.category}</td>
                <td className="p-3 text-right font-medium">{item.quantity}</td>
                <td className="p-3 text-right text-sm">{item.reorder_point}</td>
                <td className="p-3 text-right">${item.unit_price.toFixed(2)}</td>
                <td className="p-3">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                    ${item.quantity <= 0 ? 'bg-red-100 text-red-800 border border-red-200' : 
                      item.quantity <= item.reorder_point ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                      'bg-green-100 text-green-800 border border-green-200'}`}>
                    {item.quantity <= 0 ? 'Out of Stock' : 
                      item.quantity <= item.reorder_point ? 'Low Stock' : 
                      'In Stock'}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    {/* Action buttons would go here */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
