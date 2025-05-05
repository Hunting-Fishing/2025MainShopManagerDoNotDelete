
import React, { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormSelect } from "./InventoryFormSelect";
import { InventoryFormStatus } from "./InventoryFormStatus";
import { InventoryFormActions } from "./InventoryFormActions";
import { useInventoryForm } from "./useInventoryForm";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InventoryFormProps {
  onSubmit: (data: Omit<InventoryItemExtended, "id">) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

export function InventoryForm({ onSubmit, loading, onCancel }: InventoryFormProps) {
  const {
    formData,
    categories,
    suppliers,
    formErrors,
    validateForm,
    handleChange,
    handleSelectChange,
    handleRadioChange,
  } = useInventoryForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(formData)) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <Tabs defaultValue="parts">
        <TabsList className="bg-blue-100 p-1 mb-4">
          <TabsTrigger value="parts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Parts</TabsTrigger>
          <TabsTrigger value="extendedDescription" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Extended Description</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parts" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 bg-orange-100 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex space-x-4 items-center">
                <span className="font-medium">Qty In Stock:</span>
                <span className="bg-white px-4 py-1 border border-gray-300 rounded">{formData.quantity}</span>
              </div>
              
              <div className="bg-orange-200 p-3 rounded-md border border-orange-300">
                <span className="font-bold">CODE</span>
                <RadioGroup 
                  value={formData.itemCondition || "New"} 
                  onValueChange={(value) => handleRadioChange("itemCondition", value)}
                  className="mt-2 space-y-1"
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
            
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <InventoryFormField
                    label="Part #"
                    name="partNumber"
                    value={formData.partNumber || ""}
                    onChange={handleChange}
                    placeholder="Enter part number"
                  />
                  
                  <InventoryFormField
                    label="Description"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter item description"
                    error={formErrors.name}
                  />
                </div>
                
                <div className="space-y-4">
                  <InventoryFormField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter storage location"
                  />
                  
                  <InventoryFormField
                    label="Manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer || ""}
                    onChange={handleChange}
                    placeholder="Enter manufacturer"
                  />
                </div>
                
                <InventoryFormSelect
                  id="category"
                  label="Category"
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  options={categories}
                  error={formErrors.category}
                  required
                />
                
                <InventoryFormSelect
                  id="supplier"
                  label="Vendor"
                  value={formData.supplier}
                  onValueChange={(value) => handleSelectChange("supplier", value)}
                  options={suppliers}
                  error={formErrors.supplier}
                  required
                />
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InventoryFormField
                  label="Cost"
                  name="cost"
                  type="number"
                  value={formData.cost?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
                
                <InventoryFormField
                  label="Margin Markup"
                  name="marginMarkup"
                  type="number"
                  value={formData.marginMarkup?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
                
                <InventoryFormField
                  label="Retail Price"
                  name="retailPrice"
                  type="number"
                  value={formData.retailPrice?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
                
                <InventoryFormField
                  label="Wholesale Price"
                  name="wholesalePrice"
                  type="number"
                  value={formData.wholesalePrice?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
                
                <InventoryFormField
                  label="Special Tax"
                  name="specialTax"
                  type="number"
                  value={formData.specialTax?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InventoryFormField
                  label="On Order"
                  name="onOrder"
                  type="number"
                  value={formData.onOrder?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                />
                
                <InventoryFormField
                  label="Minimum Order"
                  name="minimumOrder"
                  type="number"
                  value={formData.minimumOrder?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                />
                
                <InventoryFormField
                  label="Total Qty Sold"
                  name="totalQtySold"
                  type="number"
                  value={formData.totalQtySold?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  readOnly
                />
                
                <InventoryFormField
                  label="Onhold"
                  name="onHold"
                  type="number"
                  value={formData.onHold?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                />
                
                <InventoryFormField
                  label="Maximum Order"
                  name="maximumOrder"
                  type="number"
                  value={formData.maximumOrder?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                />
                
                <InventoryFormField
                  label="Qty to ReOrder"
                  name="reorderPoint"
                  type="number"
                  value={formData.reorderPoint.toString()}
                  onChange={handleChange}
                  required
                  min="0"
                  error={formErrors.reorderPoint}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50 p-4 rounded-md border border-orange-200">
              <InventoryFormField
                label="Date Bought"
                name="dateBought"
                type="date"
                value={formData.dateBought || ""}
                onChange={handleChange}
              />
              
              <InventoryFormField
                label="Date Last"
                name="dateLast" 
                type="date"
                value={formData.dateLast || ""}
                onChange={handleChange}
              />
              
              <InventoryFormField
                label="Serial Numbers"
                name="serialNumbers"
                value={formData.serialNumbers || ""}
                onChange={handleChange}
              />
            </div>
            
            <Separator className="my-2" />
            
            <h3 className="text-lg font-medium">Additional Fees</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-md border border-orange-200">
              <InventoryFormField
                label="Core Charge"
                name="coreCharge"
                type="number"
                value={formData.coreCharge?.toString() || "0"}
                onChange={handleChange}
                min="0"
                step="0.01"
                description="Additional charge for returnable parts"
              />
              
              <InventoryFormField
                label="Environmental Fee"
                name="environmentalFee"
                type="number"
                value={formData.environmentalFee?.toString() || "0"}
                onChange={handleChange}
                min="0"
                step="0.01"
                description="Fee for environmentally sensitive items"
              />
              
              <InventoryFormField
                label="Freight Fee"
                name="freightFee"
                type="number"
                value={formData.freightFee?.toString() || "0"}
                onChange={handleChange}
                min="0"
                step="0.01"
                description="Additional shipping or freight costs"
              />
              
              <div className="space-y-2">
                <InventoryFormField
                  label="Other Fee"
                  name="otherFee"
                  type="number"
                  value={formData.otherFee?.toString() || "0"}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
                
                <InventoryFormField
                  label="Other Fee Description"
                  name="otherFeeDescription"
                  value={formData.otherFeeDescription || ""}
                  onChange={handleChange}
                  placeholder="Describe other fee"
                />
              </div>
            </div>
            
            <InventoryFormStatus status={formData.status} />
          </div>
        </TabsContent>
        
        <TabsContent value="extendedDescription">
          <div className="space-y-4 bg-orange-100 p-4 rounded-md">
            <h3 className="text-lg font-medium">Extended Description</h3>
            <Textarea 
              placeholder="Enter extended description or notes about this item"
              className="min-h-[200px]"
              name="description"
              value={formData.description || ""}
              onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <InventoryFormActions
        loading={loading}
        onCancel={onCancel}
        submitLabel="Save"
      />
    </form>
  );
}
