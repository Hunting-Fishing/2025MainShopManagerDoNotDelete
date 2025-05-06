
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Database, Save, RefreshCw } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { FieldSection } from "./FieldSection";

// Define the structure for field requirements
export interface FieldRequirement {
  id: string;
  name: string;
  label: string;
  isRequired: boolean;
  description?: string;
  section: "basic" | "pricing" | "inventory" | "additional";
}

export function InventoryFieldManager() {
  const [fieldRequirements, setFieldRequirements] = useState<FieldRequirement[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize field requirements from current inventory structure
  useEffect(() => {
    // In a real app, this would load from your database
    const loadFieldRequirements = () => {
      setIsLoading(true);
      
      // Create field requirements based on InventoryItemExtended
      const requirements: FieldRequirement[] = [
        // Basic Information Section
        { id: "name", name: "name", label: "Item Name", isRequired: false, section: "basic", 
          description: "The name of the inventory item" },
        { id: "sku", name: "sku", label: "SKU", isRequired: false, section: "basic",
          description: "Stock Keeping Unit - unique identifier" },
        { id: "partNumber", name: "partNumber", label: "Part Number", isRequired: false, section: "basic" },
        { id: "category", name: "category", label: "Category", isRequired: false, section: "basic" },
        { id: "manufacturer", name: "manufacturer", label: "Manufacturer", isRequired: false, section: "basic" },
        { id: "description", name: "description", label: "Description", isRequired: false, section: "basic" },
        { id: "barcode", name: "barcode", label: "Barcode", isRequired: false, section: "basic" },
        { id: "itemCondition", name: "itemCondition", label: "Item Condition", isRequired: false, section: "basic" },
        
        // Pricing Section
        { id: "cost", name: "cost", label: "Cost", isRequired: false, section: "pricing" },
        { id: "unitPrice", name: "unitPrice", label: "Unit Price", isRequired: false, section: "pricing" },
        { id: "marginMarkup", name: "marginMarkup", label: "Margin/Markup", isRequired: false, section: "pricing" },
        { id: "retailPrice", name: "retailPrice", label: "Retail Price", isRequired: false, section: "pricing" },
        { id: "wholesalePrice", name: "wholesalePrice", label: "Wholesale Price", isRequired: false, section: "pricing" },
        { id: "specialTax", name: "specialTax", label: "Special Tax", isRequired: false, section: "pricing" },
        { id: "coreCharge", name: "coreCharge", label: "Core Charge", isRequired: false, section: "pricing" },
        { id: "environmentalFee", name: "environmentalFee", label: "Environmental Fee", isRequired: false, section: "pricing" },
        { id: "freightFee", name: "freightFee", label: "Freight Fee", isRequired: false, section: "pricing" },
        { id: "otherFee", name: "otherFee", label: "Other Fee", isRequired: false, section: "pricing" },
        { id: "otherFeeDescription", name: "otherFeeDescription", label: "Other Fee Description", isRequired: false, section: "pricing" },
        
        // Inventory Management Section
        { id: "quantity", name: "quantity", label: "Quantity", isRequired: false, section: "inventory" },
        { id: "reorderPoint", name: "reorderPoint", label: "Reorder Point", isRequired: false, section: "inventory" },
        { id: "reorderQuantity", name: "reorderQuantity", label: "Reorder Quantity", isRequired: false, section: "inventory" },
        { id: "location", name: "location", label: "Location", isRequired: false, section: "inventory" },
        { id: "supplier", name: "supplier", label: "Supplier", isRequired: false, section: "inventory" },
        { id: "onOrder", name: "onOrder", label: "On Order", isRequired: false, section: "inventory" },
        { id: "onHold", name: "onHold", label: "On Hold", isRequired: false, section: "inventory" },
        { id: "minimumOrder", name: "minimumOrder", label: "Minimum Order", isRequired: false, section: "inventory" },
        { id: "maximumOrder", name: "maximumOrder", label: "Maximum Order", isRequired: false, section: "inventory" },
        
        // Additional Information Section
        { id: "totalQtySold", name: "totalQtySold", label: "Total Quantity Sold", isRequired: false, section: "additional" },
        { id: "dateBought", name: "dateBought", label: "Date Bought", isRequired: false, section: "additional" },
        { id: "dateLast", name: "dateLast", label: "Last Sale Date", isRequired: false, section: "additional" },
        { id: "serialNumbers", name: "serialNumbers", label: "Serial Numbers", isRequired: false, section: "additional" },
      ];
      
      setFieldRequirements(requirements);
      setIsLoading(false);
    };
    
    loadFieldRequirements();
  }, []);

  // Toggle a field's required status
  const toggleRequiredField = (fieldId: string) => {
    setFieldRequirements(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, isRequired: !field.isRequired } 
          : field
      )
    );
  };

  // Save the field configuration
  const saveConfiguration = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, you would save this to your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Field requirements have been updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your settings",
        variant: "destructive",
      });
      console.error("Error saving field requirements:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default settings
  const resetToDefaults = () => {
    // Here you would reset to your organization's defaults
    setFieldRequirements(prev => 
      prev.map(field => ({ ...field, isRequired: false }))
    );
    
    toast({
      title: "Reset complete",
      description: "All fields have been set to optional",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group fields by section
  const basicFields = fieldRequirements.filter(field => field.section === "basic");
  const pricingFields = fieldRequirements.filter(field => field.section === "pricing");
  const inventoryFields = fieldRequirements.filter(field => field.section === "inventory");
  const additionalFields = fieldRequirements.filter(field => field.section === "additional");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Requirements Configuration
          </CardTitle>
          <CardDescription>
            Configure which fields are mandatory when adding or editing inventory items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground mb-4">
            Toggle switches to mark fields as required. Required fields must be filled in before an inventory item can be saved.
          </p>
          
          <FieldSection 
            title="Basic Information"
            description="Essential information about the inventory item"
            fields={basicFields}
            onToggle={toggleRequiredField}
          />
          
          <Separator className="my-6" />
          
          <FieldSection 
            title="Pricing Information"
            description="Cost and pricing details"
            fields={pricingFields}
            onToggle={toggleRequiredField}
          />
          
          <Separator className="my-6" />
          
          <FieldSection 
            title="Inventory Management"
            description="Stock control and supplier information"
            fields={inventoryFields}
            onToggle={toggleRequiredField}
          />
          
          <Separator className="my-6" />
          
          <FieldSection 
            title="Additional Information"
            description="Optional tracking and historical data"
            fields={additionalFields}
            onToggle={toggleRequiredField}
          />
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button 
              onClick={saveConfiguration}
              disabled={isSaving}
              className="bg-esm-blue-600 hover:bg-esm-blue-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
