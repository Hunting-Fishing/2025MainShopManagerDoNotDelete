
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FieldSection } from "./FieldSection";

// Define the field definition type
export interface FieldDefinition {
  id: string;
  label: string;
  isRequired: boolean;
  isVisible: boolean;
  description?: string;
}

export function InventoryFieldManager() {
  // Define field states for different sections
  const [generalFields, setGeneralFields] = useState<FieldDefinition[]>([
    { id: "name", label: "Item Name", isRequired: true, isVisible: true, description: "The name of the inventory item" },
    { id: "partNumber", label: "Part Number", isRequired: false, isVisible: true, description: "Manufacturer's part number" },
    { id: "sku", label: "SKU", isRequired: true, isVisible: true, description: "Stock keeping unit - unique identifier" },
    { id: "barcode", label: "Barcode", isRequired: false, isVisible: true, description: "UPC or other barcode" },
    { id: "description", label: "Description", isRequired: false, isVisible: true, description: "Detailed description of the item" },
    { id: "notes", label: "Notes", isRequired: false, isVisible: true, description: "Additional notes about the item" },
  ]);

  const [categoryFields, setCategoryFields] = useState<FieldDefinition[]>([
    { id: "category", label: "Category", isRequired: true, isVisible: true, description: "Main category of the item" },
    { id: "subcategory", label: "Subcategory", isRequired: false, isVisible: true, description: "Subcategory for more specific classification" },
    { id: "manufacturer", label: "Brand/Manufacturer", isRequired: false, isVisible: true, description: "Name of the manufacturer or brand" },
    { id: "vehicleCompatibility", label: "Vehicle Compatibility", isRequired: false, isVisible: true, description: "Compatible vehicles for this part" },
  ]);

  const [stockFields, setStockFields] = useState<FieldDefinition[]>([
    { id: "quantity", label: "Quantity In Stock", isRequired: true, isVisible: true, description: "Current quantity in inventory" },
    { id: "reorderPoint", label: "Reorder Level", isRequired: false, isVisible: true, description: "Quantity threshold for reordering" },
    { id: "onOrder", label: "Quantity On Order", isRequired: false, isVisible: true, description: "Quantity currently ordered but not received" },
    { id: "onHold", label: "Quantity Reserved", isRequired: false, isVisible: true, description: "Quantity reserved for work orders or customers" },
    { id: "location", label: "Location", isRequired: false, isVisible: true, description: "Storage location within facility" },
  ]);

  const [pricingFields, setPricingFields] = useState<FieldDefinition[]>([
    { id: "cost", label: "Unit Cost", isRequired: false, isVisible: true, description: "Cost to purchase from supplier" },
    { id: "unitPrice", label: "Unit Price", isRequired: true, isVisible: true, description: "Selling price per unit" },
    { id: "marginMarkup", label: "Markup % / Margin", isRequired: false, isVisible: true, description: "Profit margin percentage" },
    { id: "wholesalePrice", label: "Wholesale Price", isRequired: false, isVisible: true, description: "Price for wholesale customers" },
    { id: "specialTax", label: "Special Tax", isRequired: false, isVisible: true, description: "Any special taxes that apply" },
    { id: "warrantyPeriod", label: "Warranty Period", isRequired: false, isVisible: true, description: "Warranty period for the item" },
  ]);

  const [supplierFields, setSupplierFields] = useState<FieldDefinition[]>([
    { id: "supplier", label: "Supplier", isRequired: false, isVisible: true, description: "Primary supplier for this item" },
    { id: "dateBought", label: "Last Ordered Date", isRequired: false, isVisible: true, description: "Date when this item was last ordered" },
    { id: "dateLast", label: "Last Used On", isRequired: false, isVisible: true, description: "Date when this item was last used" },
    { id: "minimumOrder", label: "Minimum Order Quantity", isRequired: false, isVisible: true, description: "Minimum quantity that must be ordered" },
  ]);

  // Handle visibility toggle
  const handleVisibilityChange = (fieldId: string, isVisible: boolean, section: string) => {
    const updateFields = (fields: FieldDefinition[]) => {
      return fields.map(field => 
        field.id === fieldId ? { ...field, isVisible } : field
      );
    };

    // Update the appropriate section
    switch (section) {
      case "general":
        setGeneralFields(updateFields(generalFields));
        break;
      case "category":
        setCategoryFields(updateFields(categoryFields));
        break;
      case "stock":
        setStockFields(updateFields(stockFields));
        break;
      case "pricing":
        setPricingFields(updateFields(pricingFields));
        break;
      case "supplier":
        setSupplierFields(updateFields(supplierFields));
        break;
    }
  };

  // Handle required toggle
  const handleRequiredChange = (fieldId: string, isRequired: boolean, section: string) => {
    const updateFields = (fields: FieldDefinition[]) => {
      return fields.map(field => 
        field.id === fieldId ? { ...field, isRequired } : field
      );
    };

    // Update the appropriate section
    switch (section) {
      case "general":
        setGeneralFields(updateFields(generalFields));
        break;
      case "category":
        setCategoryFields(updateFields(categoryFields));
        break;
      case "stock":
        setStockFields(updateFields(stockFields));
        break;
      case "pricing":
        setPricingFields(updateFields(pricingFields));
        break;
      case "supplier":
        setSupplierFields(updateFields(supplierFields));
        break;
    }
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // In a real app, this would save to the database
    // For now, we'll just show a toast notification
    toast({
      title: "Settings Saved",
      description: "Your inventory field settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Inventory Field Manager</h2>
          <p className="text-muted-foreground">Configure which inventory fields are mandatory or optional for your organization.</p>
        </div>
        <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Visibility & Requirements</CardTitle>
          <CardDescription>Toggle field visibility and set whether fields are required during data entry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldSection 
            title="General Information" 
            description="Basic details about inventory items" 
            fields={generalFields}
            onToggle={(fieldId) => {
              const field = generalFields.find(f => f.id === fieldId);
              if (field) {
                handleRequiredChange(fieldId, !field.isRequired, "general");
              }
            }}
          />
          
          <FieldSection 
            title="Categorization" 
            description="How items are categorized in your inventory" 
            fields={categoryFields}
            onToggle={(fieldId) => {
              const field = categoryFields.find(f => f.id === fieldId);
              if (field) {
                handleRequiredChange(fieldId, !field.isRequired, "category");
              }
            }}
          />
          
          <FieldSection 
            title="Stock Management" 
            description="Quantities and location information" 
            fields={stockFields}
            onToggle={(fieldId) => {
              const field = stockFields.find(f => f.id === fieldId);
              if (field) {
                handleRequiredChange(fieldId, !field.isRequired, "stock");
              }
            }}
          />
          
          <FieldSection 
            title="Pricing Information" 
            description="Cost, prices, and pricing calculations" 
            fields={pricingFields}
            onToggle={(fieldId) => {
              const field = pricingFields.find(f => f.id === fieldId);
              if (field) {
                handleRequiredChange(fieldId, !field.isRequired, "pricing");
              }
            }}
          />
          
          <FieldSection 
            title="Supplier Details" 
            description="Information about suppliers and ordering" 
            fields={supplierFields}
            onToggle={(fieldId) => {
              const field = supplierFields.find(f => f.id === fieldId);
              if (field) {
                handleRequiredChange(fieldId, !field.isRequired, "supplier");
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
