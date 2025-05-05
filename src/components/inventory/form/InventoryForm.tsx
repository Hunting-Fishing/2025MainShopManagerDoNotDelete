
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormSelect } from "./InventoryFormSelect";
import { InventoryFormStatus } from "./InventoryFormStatus";
import { InventoryFormActions } from "./InventoryFormActions";
import { useInventoryForm } from "./useInventoryForm";
import { InventoryItemExtended } from "@/types/inventory";
import { Textarea } from "@/components/ui/textarea";

interface InventoryFormProps {
  initialData?: Omit<InventoryItemExtended, "id">;
  onSubmit: (data: Omit<InventoryItemExtended, "id">) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  submitLabel?: string;
}

export function InventoryForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Save",
}: InventoryFormProps) {
  const {
    formData,
    formErrors,
    categories,
    suppliers,
    validateForm,
    handleChange,
    handleTextAreaChange,
    handleSelectChange,
    handleRadioChange,
  } = useInventoryForm();
  
  const [activeTab, setActiveTab] = useState("general");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate the form data
    if (validateForm(formData)) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 mb-6">
          <TabsTrigger value="general" className="text-center">General</TabsTrigger>
          <TabsTrigger value="pricing" className="text-center">Pricing</TabsTrigger>
          <TabsTrigger value="inventory" className="text-center">Inventory</TabsTrigger>
          <TabsTrigger value="supplier" className="text-center">Supplier</TabsTrigger>
          <TabsTrigger value="additional" className="text-center">Additional</TabsTrigger>
        </TabsList>
        
        {/* General Information Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InventoryFormField
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                required
                placeholder="Enter item name"
              />
              
              <InventoryFormField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                error={formErrors.sku}
                required
                placeholder="Enter SKU"
              />
              
              <InventoryFormField
                label="Part Number"
                name="partNumber"
                value={formData.partNumber || ""}
                onChange={handleChange}
                placeholder="Enter part number"
              />
              
              <InventoryFormSelect
                id="category"
                label="Category"
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                options={categories}
                error={formErrors.category}
                required
              />
              
              <InventoryFormField
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer || ""}
                onChange={handleChange}
                placeholder="Enter manufacturer"
              />
              
              <InventoryFormField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter storage location"
              />
              
              <div className="col-span-2">
                <Label htmlFor="description" className="block mb-2">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleTextAreaChange}
                  placeholder="Enter item description"
                  className="min-h-[100px] w-full"
                />
              </div>
              
              <div className="col-span-2">
                <Label className="block mb-2">Item Condition</Label>
                <RadioGroup 
                  value={formData.itemCondition || "New"} 
                  onValueChange={(value) => handleRadioChange("itemCondition", value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="New" id="condition-new" />
                    <Label htmlFor="condition-new">New</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Used" id="condition-used" />
                    <Label htmlFor="condition-used">Used</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Rebuilt" id="condition-rebuilt" />
                    <Label htmlFor="condition-rebuilt">Rebuilt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OEM" id="condition-oem" />
                    <Label htmlFor="condition-oem">OEM</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InventoryFormField
                label="Cost"
                name="cost"
                type="number"
                value={formData.cost?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Markup/Margin %"
                name="marginMarkup"
                type="number"
                value={formData.marginMarkup?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormField
                label="Unit Price"
                name="unitPrice"
                type="number"
                value={formData.unitPrice.toString()}
                onChange={handleChange}
                error={formErrors.unitPrice}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Retail Price"
                name="retailPrice"
                type="number"
                value={formData.retailPrice?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Wholesale Price"
                name="wholesalePrice"
                type="number"
                value={formData.wholesalePrice?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Special Tax %"
                name="specialTax"
                type="number"
                value={formData.specialTax?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </Card>
          
          {/* Additional Fees Card */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Additional Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InventoryFormField
                label="Core Charge"
                name="coreCharge"
                type="number"
                value={formData.coreCharge?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Environmental Fee"
                name="environmentalFee"
                type="number"
                value={formData.environmentalFee?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Freight Fee"
                name="freightFee"
                type="number"
                value={formData.freightFee?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <InventoryFormField
                label="Other Fee"
                name="otherFee"
                type="number"
                value={formData.otherFee?.toString() || "0"}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <div className="col-span-2">
                <Label htmlFor="otherFeeDescription" className="block mb-2">Other Fee Description</Label>
                <Textarea
                  id="otherFeeDescription"
                  name="otherFeeDescription"
                  value={formData.otherFeeDescription || ""}
                  onChange={handleTextAreaChange}
                  placeholder="Describe other fee"
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Inventory Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InventoryFormField
                label="Quantity in Stock"
                name="quantity"
                type="number"
                value={formData.quantity.toString()}
                onChange={handleChange}
                error={formErrors.quantity}
                required
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormField
                label="On Order"
                name="onOrder"
                type="number"
                value={formData.onOrder?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormField
                label="On Hold"
                name="onHold"
                type="number"
                value={formData.onHold?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormField
                label="Reorder Point"
                name="reorderPoint"
                type="number"
                value={formData.reorderPoint.toString()}
                onChange={handleChange}
                error={formErrors.reorderPoint}
                required
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormField
                label="Minimum Order"
                name="minimumOrder"
                type="number"
                value={formData.minimumOrder?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormField
                label="Maximum Order"
                name="maximumOrder"
                type="number"
                value={formData.maximumOrder?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
              />
              
              <InventoryFormStatus status={formData.status} />
              
              <InventoryFormField
                label="Total Quantity Sold"
                name="totalQtySold"
                type="number"
                value={formData.totalQtySold?.toString() || "0"}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                disabled
              />
            </div>
          </Card>
        </TabsContent>
        
        {/* Supplier Tab */}
        <TabsContent value="supplier" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InventoryFormSelect
                id="supplier"
                label="Supplier"
                value={formData.supplier}
                onValueChange={(value) => handleSelectChange("supplier", value)}
                options={suppliers}
                error={formErrors.supplier}
                required
              />
              
              <InventoryFormField
                label="Date Bought"
                name="dateBought"
                type="date"
                value={formData.dateBought || ""}
                onChange={handleChange}
              />
              
              <InventoryFormField
                label="Date Last Ordered"
                name="dateLast"
                type="date"
                value={formData.dateLast || ""}
                onChange={handleChange}
              />
            </div>
          </Card>
        </TabsContent>
        
        {/* Additional Information Tab */}
        <TabsContent value="additional" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="serialNumbers" className="block mb-2">Serial Numbers</Label>
                <Textarea
                  id="serialNumbers"
                  name="serialNumbers"
                  value={formData.serialNumbers || ""}
                  onChange={handleTextAreaChange}
                  placeholder="Enter serial numbers, one per line"
                  className="min-h-[150px] w-full"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <InventoryFormActions 
        loading={loading}
        onCancel={onCancel}
        submitLabel={submitLabel}
      />
    </form>
  );
}
