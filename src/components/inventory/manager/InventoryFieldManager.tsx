
import React, { useState, useEffect } from "react";
import { FieldSection } from "./FieldSection";
import { toast } from "sonner";
import { Column, ColumnId } from "@/components/inventory/table/SortableColumnHeader";

export interface FieldDefinition {
  id: string;
  label: string;
  isRequired: boolean;
  description?: string;
}

export function InventoryFieldManager() {
  const [basicFields, setBasicFields] = useState<FieldDefinition[]>([
    { id: "name", label: "Name", isRequired: true, description: "Item name or title" },
    { id: "sku", label: "SKU", isRequired: true, description: "Stock keeping unit" },
    { id: "partNumber", label: "Part Number", isRequired: false, description: "Manufacturer part number" },
    { id: "category", label: "Category", isRequired: true, description: "Primary category" }
  ]);
  
  const [stockFields, setStockFields] = useState<FieldDefinition[]>([
    { id: "quantity", label: "Quantity", isRequired: true, description: "Current stock level" },
    { id: "location", label: "Location", isRequired: false, description: "Storage location" },
    { id: "reorderPoint", label: "Reorder Point", isRequired: false, description: "Minimum quantity before reordering" },
    { id: "cost", label: "Cost", isRequired: true, description: "Unit cost price" }
  ]);
  
  const [pricingFields, setPricingFields] = useState<FieldDefinition[]>([
    { id: "unitPrice", label: "Unit Price", isRequired: true, description: "Selling price per unit" },
    { id: "marginMarkup", label: "Markup/Margin", isRequired: false, description: "Profit percentage" }
  ]);

  const [visibleColumns, setVisibleColumns] = useState<Column[]>([]);

  // Load table column settings to sync with field manager
  useEffect(() => {
    const loadVisibleColumns = () => {
      const savedColumns = localStorage.getItem("inventoryTableColumns");
      if (savedColumns) {
        const columns = JSON.parse(savedColumns);
        setVisibleColumns(columns.filter((col: Column) => col.visible));
      }
    };
    
    loadVisibleColumns();
    
    // Listen for column changes from the columns manager
    const handleColumnsUpdated = (event: CustomEvent) => {
      const columns = event.detail;
      setVisibleColumns(columns.filter((col: Column) => col.visible));
    };
    
    window.addEventListener('inventoryColumnsUpdated', handleColumnsUpdated as EventListener);
    window.addEventListener('storage', loadVisibleColumns);
    
    return () => {
      window.removeEventListener('inventoryColumnsUpdated', handleColumnsUpdated as EventListener);
      window.removeEventListener('storage', loadVisibleColumns);
    };
  }, []);

  // Filter fields based on column visibility
  const filterFieldsByVisibility = (fields: FieldDefinition[]) => {
    if (visibleColumns.length === 0) return fields;
    
    return fields.filter(field => {
      const columnId = field.id as ColumnId;
      const column = visibleColumns.find(col => col.id === columnId);
      return column?.visible !== false; // If column doesn't exist or is visible, show the field
    });
  };

  // Handler for toggling field requirement status
  const handleToggleField = (fieldId: string, section: "basic" | "stock" | "pricing") => {
    switch (section) {
      case "basic":
        setBasicFields(fields => fields.map(field => 
          field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
        ));
        break;
      case "stock":
        setStockFields(fields => fields.map(field => 
          field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
        ));
        break;
      case "pricing":
        setPricingFields(fields => fields.map(field => 
          field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
        ));
        break;
    }
    // Show toast notification
    toast.success("Field settings updated");
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("inventoryBasicFields", JSON.stringify(basicFields));
    localStorage.setItem("inventoryStockFields", JSON.stringify(stockFields));
    localStorage.setItem("inventoryPricingFields", JSON.stringify(pricingFields));
  }, [basicFields, stockFields, pricingFields]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedBasicFields = localStorage.getItem("inventoryBasicFields");
    const savedStockFields = localStorage.getItem("inventoryStockFields");
    const savedPricingFields = localStorage.getItem("inventoryPricingFields");
    
    if (savedBasicFields) setBasicFields(JSON.parse(savedBasicFields));
    if (savedStockFields) setStockFields(JSON.parse(savedStockFields));
    if (savedPricingFields) setPricingFields(JSON.parse(savedPricingFields));
  }, []);

  // Filter fields based on column visibility
  const visibleBasicFields = filterFieldsByVisibility(basicFields);
  const visibleStockFields = filterFieldsByVisibility(stockFields);
  const visiblePricingFields = filterFieldsByVisibility(pricingFields);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-8">
        <FieldSection 
          title="Basic Information" 
          description="Core details about your inventory items"
          fields={visibleBasicFields}
          onToggle={(fieldId) => handleToggleField(fieldId, "basic")}
        />
        
        <FieldSection 
          title="Stock Information" 
          description="Quantity and storage details"
          fields={visibleStockFields}
          onToggle={(fieldId) => handleToggleField(fieldId, "stock")}
        />
        
        <FieldSection 
          title="Pricing" 
          description="Cost and selling price information"
          fields={visiblePricingFields}
          onToggle={(fieldId) => handleToggleField(fieldId, "pricing")}
        />
      </div>
    </div>
  );
}
