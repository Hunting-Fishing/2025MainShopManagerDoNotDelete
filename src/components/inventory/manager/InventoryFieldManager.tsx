
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FieldSection } from "./FieldSection";
import { Column } from "@/components/inventory/table/SortableColumnHeader";

export interface FieldDefinition {
  id: string;
  label: string;
  isRequired: boolean;
  description?: string;
}

export function InventoryFieldManager() {
  const [basicFields, setBasicFields] = useState<FieldDefinition[]>([]);
  const [detailsFields, setDetailsFields] = useState<FieldDefinition[]>([]);
  const [pricingFields, setPricingFields] = useState<FieldDefinition[]>([]);
  const [locationFields, setLocationFields] = useState<FieldDefinition[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    loadFieldSettings();
  }, []);

  // Monitor changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadFieldSettings();
    };

    window.addEventListener('inventoryColumnsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('inventoryColumnsUpdated', handleStorageChange);
    };
  }, []);

  const loadFieldSettings = () => {
    // First get the visible columns from localStorage
    const savedColumnsString = localStorage.getItem("inventoryTableColumns");
    let visibleColumns: Column[] = [];
    
    if (savedColumnsString) {
      const savedColumns = JSON.parse(savedColumnsString);
      visibleColumns = savedColumns.filter((col: Column) => col.visible);
    }
    
    // Then get the required fields from localStorage
    const requiredFieldsString = localStorage.getItem("inventoryRequiredFields");
    const requiredFields = requiredFieldsString ? JSON.parse(requiredFieldsString) : {};
    
    // Map the visible columns to field definitions
    const mapToFieldDefinitions = (columns: Column[], category: string): FieldDefinition[] => {
      return columns
        .filter(col => {
          // Filter columns by category
          if (category === 'basic') {
            return ['name', 'sku', 'partNumber', 'barcode', 'manufacturer'].includes(col.id);
          } else if (category === 'details') {
            return ['description', 'category', 'subcategory', 'vehicleCompatibility', 'warrantyPeriod'].includes(col.id);
          } else if (category === 'pricing') {
            return ['cost', 'unitPrice', 'marginMarkup', 'totalValue'].includes(col.id);
          } else if (category === 'location') {
            return ['location', 'quantity', 'reorderPoint', 'quantityReserved', 'quantityAvailable', 'onOrder', 'supplier'].includes(col.id);
          }
          return false;
        })
        .map(col => ({
          id: col.id,
          label: col.label,
          isRequired: requiredFields[col.id] || false,
          description: getFieldDescription(col.id)
        }));
    };

    // Set the fields by category
    setBasicFields(mapToFieldDefinitions(visibleColumns, 'basic'));
    setDetailsFields(mapToFieldDefinitions(visibleColumns, 'details'));
    setPricingFields(mapToFieldDefinitions(visibleColumns, 'pricing'));
    setLocationFields(mapToFieldDefinitions(visibleColumns, 'location'));
    
    // Reset the changes flag when loading
    setHasChanges(false);
  };

  const getFieldDescription = (fieldId: string): string => {
    const descriptions: Record<string, string> = {
      name: "The name displayed for this inventory item",
      sku: "Stock Keeping Unit - unique identifier for the item",
      partNumber: "Manufacturer's part number",
      barcode: "Barcode or UPC for scanning",
      manufacturer: "Brand or manufacturer of the item",
      description: "Detailed description of the item",
      category: "Primary category for grouping items",
      subcategory: "More specific category classification",
      vehicleCompatibility: "Compatible vehicle models",
      warrantyPeriod: "Length of warranty coverage",
      cost: "Wholesale cost of the item",
      unitPrice: "Retail selling price",
      marginMarkup: "Profit margin percentage",
      totalValue: "Total value of inventory on hand",
      location: "Where the item is stored",
      quantity: "Total number of items in stock",
      reorderPoint: "Stock level that triggers reordering",
      quantityReserved: "Items allocated to work orders",
      quantityAvailable: "Items available for use",
      onOrder: "Quantity currently on order",
      supplier: "Vendor providing the item"
    };

    return descriptions[fieldId] || "";
  };

  const handleToggleRequired = (fieldId: string, sectionType: string) => {
    // Update the appropriate section state
    let updatedFields: FieldDefinition[] = [];
    
    if (sectionType === 'basic') {
      updatedFields = basicFields.map(field => 
        field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
      );
      setBasicFields(updatedFields);
    } else if (sectionType === 'details') {
      updatedFields = detailsFields.map(field => 
        field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
      );
      setDetailsFields(updatedFields);
    } else if (sectionType === 'pricing') {
      updatedFields = pricingFields.map(field => 
        field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
      );
      setPricingFields(updatedFields);
    } else if (sectionType === 'location') {
      updatedFields = locationFields.map(field => 
        field.id === fieldId ? { ...field, isRequired: !field.isRequired } : field
      );
      setLocationFields(updatedFields);
    }

    // Set changes flag
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Combine all field requirements into one object
    const requiredFields: Record<string, boolean> = {};
    
    [...basicFields, ...detailsFields, ...pricingFields, ...locationFields].forEach(field => {
      requiredFields[field.id] = field.isRequired;
    });
    
    // Save to localStorage
    localStorage.setItem("inventoryRequiredFields", JSON.stringify(requiredFields));
    
    // Reset changes flag
    setHasChanges(false);
    
    // Show success toast
    toast.success("Required fields settings saved successfully");
  };

  const resetSettings = () => {
    // Reload settings from localStorage
    loadFieldSettings();
    toast.info("Settings reset to last saved values");
  };

  return (
    <div className="space-y-6">
      {/* Save/Reset Buttons */}
      <div className="flex justify-end space-x-4 mb-6">
        <Button 
          variant="outline" 
          onClick={resetSettings} 
          disabled={!hasChanges}
          className="border-gray-300"
        >
          Reset Changes
        </Button>
        <Button 
          onClick={saveSettings} 
          disabled={!hasChanges}
          className={`${hasChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400"} text-white`}
        >
          Save Settings
        </Button>
      </div>

      {/* Basic Information Fields */}
      <FieldSection
        title="Basic Information"
        description="Configure required fields for item identification"
        fields={basicFields}
        onToggle={(fieldId) => handleToggleRequired(fieldId, 'basic')}
      />
      
      {/* Item Details Fields */}
      <FieldSection
        title="Item Details"
        description="Configure required fields for item specifications"
        fields={detailsFields}
        onToggle={(fieldId) => handleToggleRequired(fieldId, 'details')}
      />

      {/* Pricing Fields */}
      <FieldSection
        title="Pricing Information"
        description="Configure required fields for pricing details"
        fields={pricingFields}
        onToggle={(fieldId) => handleToggleRequired(fieldId, 'pricing')}
      />

      {/* Location & Quantity Fields */}
      <FieldSection
        title="Location & Quantity"
        description="Configure required fields for stock management"
        fields={locationFields}
        onToggle={(fieldId) => handleToggleRequired(fieldId, 'location')}
      />
      
      {/* Save Button at bottom */}
      {hasChanges && (
        <div className="pt-4 border-t mt-8">
          <Button 
            onClick={saveSettings} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Required Fields Settings
          </Button>
        </div>
      )}
    </div>
  );
}
