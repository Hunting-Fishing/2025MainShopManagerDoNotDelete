
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Column, ColumnId } from "@/components/inventory/table/SortableColumnHeader";

export const InventoryTableColumnsManager = () => {
  const initialColumns: Column[] = [
    { id: "partNumber", label: "Part #", visible: true },
    { id: "name", label: "Item Name", visible: true },
    { id: "sku", label: "SKU", visible: true },
    { id: "barcode", label: "Barcode", visible: true },
    { id: "category", label: "Category", visible: true },
    { id: "subcategory", label: "Subcategory", visible: true },
    { id: "manufacturer", label: "Brand/Manufacturer", visible: true },
    { id: "vehicleCompatibility", label: "Vehicle Compatibility", visible: true },
    { id: "location", label: "Location", visible: true },
    { id: "quantity", label: "Quantity In Stock", visible: true },
    { id: "quantityReserved", label: "Quantity Reserved", visible: false },
    { id: "quantityAvailable", label: "Quantity Available", visible: false },
    { id: "onOrder", label: "Qty on Order", visible: true },
    { id: "reorderPoint", label: "Reorder Level", visible: true },
    { id: "cost", label: "Unit Cost", visible: true },
    { id: "unitPrice", label: "Unit Price", visible: true },
    { id: "marginMarkup", label: "Markup % / Margin", visible: false },
    { id: "totalValue", label: "Total Value", visible: false },
    { id: "warrantyPeriod", label: "Warranty Period", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "supplier", label: "Supplier", visible: true },
    { id: "dateBought", label: "Last Ordered Date", visible: false },
    { id: "dateLast", label: "Last Used On", visible: false },
    { id: "notes", label: "Notes", visible: false },
  ];

  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    // Load saved columns from localStorage
    const savedColumns = localStorage.getItem("inventoryTableColumns");
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      setColumns(initialColumns);
    }
  }, []);

  const handleColumnToggle = (columnId: ColumnId) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSelectAll = () => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({ ...col, visible: true }))
    );
    toast.info("All columns are now visible");
  };

  const handleDeselectAll = () => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({ ...col, visible: false }))
    );
    toast.info("All columns are now hidden");
  };

  const saveColumnSettings = () => {
    localStorage.setItem("inventoryTableColumns", JSON.stringify(columns));
    
    // Dispatch a custom event to notify other components of the change
    const event = new CustomEvent('inventoryColumnsUpdated', { detail: columns });
    window.dispatchEvent(event);
    
    toast.success("Column settings saved successfully");
  };

  const resetToDefault = () => {
    setColumns(initialColumns);
    localStorage.removeItem("inventoryTableColumns");
    
    // Dispatch a custom event to notify other components of the change
    const event = new CustomEvent('inventoryColumnsUpdated', { detail: initialColumns });
    window.dispatchEvent(event);
    
    toast.success("Column settings reset to default");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
            className="text-blue-600 border-blue-500 hover:bg-blue-50"
          >
            Show All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeselectAll}
            className="text-red-600 border-red-500 hover:bg-red-50"
          >
            Hide All
          </Button>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={resetToDefault}
            className="border-gray-300"
          >
            Reset to Default
          </Button>
          <Button 
            onClick={saveColumnSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
            <Checkbox
              id={`column-${column.id}`}
              checked={column.visible}
              onCheckedChange={() => handleColumnToggle(column.id)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label
              htmlFor={`column-${column.id}`}
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {column.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
