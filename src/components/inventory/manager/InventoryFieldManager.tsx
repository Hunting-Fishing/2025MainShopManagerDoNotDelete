
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FieldSection } from "./FieldSection";

// Define the field types
export interface FieldDefinition {
  id: string;
  label: string;
  isRequired: boolean;
  description?: string;
}

export function InventoryFieldManager() {
  // Create state for basic, advanced, and financial fields
  const [basicFields, setBasicFields] = useState<FieldDefinition[]>([
    { id: "name", label: "Item Name", isRequired: true },
    { id: "sku", label: "SKU", isRequired: true },
    { id: "description", label: "Description", isRequired: false },
    { id: "category", label: "Category", isRequired: true },
    { id: "supplier", label: "Supplier", isRequired: false },
  ]);
  
  const [advancedFields, setAdvancedFields] = useState<FieldDefinition[]>([
    { id: "location", label: "Storage Location", isRequired: false },
    { id: "reorderPoint", label: "Reorder Point", isRequired: false },
    { id: "partNumber", label: "Part Number", isRequired: false },
    { id: "manufacturer", label: "Manufacturer", isRequired: false },
    { id: "barcode", label: "Barcode", isRequired: false },
  ]);
  
  const [financialFields, setFinancialFields] = useState<FieldDefinition[]>([
    { id: "cost", label: "Cost Price", isRequired: false },
    { id: "unitPrice", label: "Unit Price", isRequired: true },
    { id: "marginMarkup", label: "Margin/Markup", isRequired: false },
    { id: "retailPrice", label: "Retail Price", isRequired: false },
    { id: "wholesalePrice", label: "Wholesale Price", isRequired: false },
  ]);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("inventoryRequiredFields");
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        
        if (parsed.basicFields) setBasicFields(parsed.basicFields);
        if (parsed.advancedFields) setAdvancedFields(parsed.advancedFields);
        if (parsed.financialFields) setFinancialFields(parsed.financialFields);
      } catch (error) {
        console.error("Error parsing saved inventory settings:", error);
      }
    }
  }, []);

  // Toggle a field's required status
  const handleToggleField = (fieldId: string, fieldType: "basic" | "advanced" | "financial") => {
    const updateFields = (fields: FieldDefinition[]) => {
      return fields.map(field => {
        if (field.id === fieldId) {
          return { ...field, isRequired: !field.isRequired };
        }
        return field;
      });
    };

    if (fieldType === "basic") {
      setBasicFields(updateFields(basicFields));
    } else if (fieldType === "advanced") {
      setAdvancedFields(updateFields(advancedFields));
    } else if (fieldType === "financial") {
      setFinancialFields(updateFields(financialFields));
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      basicFields,
      advancedFields,
      financialFields,
    };
    
    localStorage.setItem("inventoryRequiredFields", JSON.stringify(settings));
    toast.success("Required fields settings saved successfully");
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setBasicFields(basicFields.map(field => ({ 
      ...field, 
      isRequired: ["name", "sku", "category"].includes(field.id) 
    })));
    setAdvancedFields(advancedFields.map(field => ({ ...field, isRequired: false })));
    setFinancialFields(financialFields.map(field => ({ 
      ...field, 
      isRequired: field.id === "unitPrice" 
    })));
    
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="space-y-8">
      <FieldSection
        title="Basic Information"
        description="Configure which basic inventory fields are required when creating or editing items"
        fields={basicFields}
        onToggle={(fieldId) => handleToggleField(fieldId, "basic")}
      />
      
      <FieldSection
        title="Advanced Details"
        description="Configure which advanced inventory fields are required"
        fields={advancedFields}
        onToggle={(fieldId) => handleToggleField(fieldId, "advanced")}
      />
      
      <FieldSection
        title="Financial Information"
        description="Configure which financial fields are required for inventory items"
        fields={financialFields}
        onToggle={(fieldId) => handleToggleField(fieldId, "financial")}
      />
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button variant="default" onClick={saveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
