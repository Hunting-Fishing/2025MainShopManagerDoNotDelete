
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FieldSection } from "@/components/inventory/manager/FieldSection";
import { toast } from "@/hooks/use-toast";

interface FieldDefinition {
  id: string;
  label: string;
  defaultVisible: boolean;
  required: boolean;
  section: string;
}

export function InventoryFieldManager() {
  const [fields, setFields] = useState<FieldDefinition[]>([
    // Basic Info
    { id: "partNumber", label: "Part Number", defaultVisible: true, required: true, section: "basic" },
    { id: "name", label: "Item Name", defaultVisible: true, required: true, section: "basic" },
    { id: "sku", label: "SKU", defaultVisible: true, required: true, section: "basic" },
    { id: "barcode", label: "Barcode", defaultVisible: true, required: false, section: "basic" },
    { id: "description", label: "Description", defaultVisible: false, required: false, section: "basic" },
    { id: "notes", label: "Notes", defaultVisible: false, required: false, section: "basic" },
    
    // Classification
    { id: "category", label: "Category", defaultVisible: true, required: true, section: "classification" },
    { id: "subcategory", label: "Subcategory", defaultVisible: false, required: false, section: "classification" },
    { id: "manufacturer", label: "Brand / Manufacturer", defaultVisible: true, required: false, section: "classification" },
    { id: "vehicleCompatibility", label: "Vehicle Compatibility", defaultVisible: false, required: false, section: "classification" },
    
    // Inventory
    { id: "quantity", label: "Quantity In Stock", defaultVisible: true, required: true, section: "inventory" },
    { id: "onHold", label: "Quantity Reserved", defaultVisible: true, required: false, section: "inventory" },
    { id: "available", label: "Quantity Available", defaultVisible: true, required: false, section: "inventory" },
    { id: "onOrder", label: "Quantity on Order", defaultVisible: true, required: false, section: "inventory" },
    { id: "reorderPoint", label: "Reorder Level", defaultVisible: true, required: false, section: "inventory" },
    { id: "reorderQuantity", label: "Reorder Quantity", defaultVisible: false, required: false, section: "inventory" },
    { id: "minimumOrder", label: "Minimum Order", defaultVisible: false, required: false, section: "inventory" },
    { id: "maximumOrder", label: "Maximum Order", defaultVisible: false, required: false, section: "inventory" },
    { id: "location", label: "Location", defaultVisible: true, required: false, section: "inventory" },
    
    // Financial
    { id: "cost", label: "Unit Cost", defaultVisible: true, required: false, section: "financial" },
    { id: "unitPrice", label: "Unit Price", defaultVisible: true, required: true, section: "financial" },
    { id: "markup", label: "Markup %", defaultVisible: true, required: false, section: "financial" },
    { id: "retailPrice", label: "Retail Price", defaultVisible: false, required: false, section: "financial" },
    { id: "wholesalePrice", label: "Wholesale Price", defaultVisible: false, required: false, section: "financial" },
    { id: "coreCharge", label: "Core Charge", defaultVisible: false, required: false, section: "financial" },
    { id: "environmentalFee", label: "Environmental Fee", defaultVisible: false, required: false, section: "financial" },
    { id: "freightFee", label: "Freight Fee", defaultVisible: false, required: false, section: "financial" },
    { id: "otherFee", label: "Other Fee", defaultVisible: false, required: false, section: "financial" },
    { id: "specialTax", label: "Special Tax", defaultVisible: false, required: false, section: "financial" },
    { id: "totalValue", label: "Total Value", defaultVisible: true, required: false, section: "financial" },
    
    // Additional
    { id: "supplier", label: "Supplier", defaultVisible: true, required: true, section: "additional" },
    { id: "dateBought", label: "Last Ordered Date", defaultVisible: true, required: false, section: "additional" },
    { id: "dateLast", label: "Last Used On", defaultVisible: true, required: false, section: "additional" },
    { id: "warrantyPeriod", label: "Warranty Period", defaultVisible: false, required: false, section: "additional" },
    { id: "itemCondition", label: "Condition", defaultVisible: false, required: false, section: "additional" },
    { id: "status", label: "Status", defaultVisible: true, required: true, section: "additional" },
    { id: "serialNumbers", label: "Serial Numbers", defaultVisible: false, required: false, section: "additional" },
  ]);

  const [showHiddenFields, setShowHiddenFields] = useState(false);

  // Set local storage on field changes
  useEffect(() => {
    localStorage.setItem('inventoryFieldSettings', JSON.stringify(fields));
  }, [fields]);

  // Load settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('inventoryFieldSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setFields(parsedSettings);
      } catch (error) {
        console.error("Error parsing saved inventory field settings:", error);
      }
    }
  }, []);

  const handleVisibilityChange = (fieldId: string, isVisible: boolean) => {
    setFields(
      fields.map(field => 
        field.id === fieldId ? { ...field, defaultVisible: isVisible } : field
      )
    );
  };

  const handleRequiredChange = (fieldId: string, isRequired: boolean) => {
    setFields(
      fields.map(field => 
        field.id === fieldId ? { ...field, required: isRequired } : field
      )
    );
  };

  const resetToDefaults = () => {
    // Reset to the original state
    localStorage.removeItem('inventoryFieldSettings');
    window.location.reload();
  };

  const saveChanges = () => {
    // In a real application, this would save to a database
    // For now, we just show a toast and rely on local storage (set in the useEffect)
    toast({
      title: "Settings saved",
      description: "Your inventory field settings have been saved.",
    });
  };

  const getFieldsBySection = (section: string) => {
    return fields.filter(field => 
      field.section === section && (showHiddenFields || field.defaultVisible)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Field Manager</CardTitle>
          <CardDescription>
            Configure which fields are visible and required when creating or editing inventory items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Switch 
              id="show-hidden" 
              checked={showHiddenFields}
              onCheckedChange={setShowHiddenFields}
            />
            <Label htmlFor="show-hidden">Show hidden fields</Label>
          </div>

          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="p-4 border rounded-md">
              <FieldSection 
                title="Basic Information"
                description="Configure basic item information fields"
                fields={getFieldsBySection('basic')}
                onVisibilityChange={handleVisibilityChange}
                onRequiredChange={handleRequiredChange}
              />
            </TabsContent>
            
            <TabsContent value="classification" className="p-4 border rounded-md">
              <FieldSection 
                title="Classification"
                description="Configure item classification fields"
                fields={getFieldsBySection('classification')}
                onVisibilityChange={handleVisibilityChange}
                onRequiredChange={handleRequiredChange}
              />
            </TabsContent>
            
            <TabsContent value="inventory" className="p-4 border rounded-md">
              <FieldSection 
                title="Inventory Tracking"
                description="Configure quantity and location fields"
                fields={getFieldsBySection('inventory')}
                onVisibilityChange={handleVisibilityChange}
                onRequiredChange={handleRequiredChange}
              />
            </TabsContent>
            
            <TabsContent value="financial" className="p-4 border rounded-md">
              <FieldSection 
                title="Financial Information"
                description="Configure pricing and cost fields"
                fields={getFieldsBySection('financial')}
                onVisibilityChange={handleVisibilityChange}
                onRequiredChange={handleRequiredChange}
              />
            </TabsContent>
            
            <TabsContent value="additional" className="p-4 border rounded-md">
              <FieldSection 
                title="Additional Information"
                description="Configure additional fields"
                fields={getFieldsBySection('additional')}
                onVisibilityChange={handleVisibilityChange}
                onRequiredChange={handleRequiredChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveChanges}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
