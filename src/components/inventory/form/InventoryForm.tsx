
import React from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormSelect } from "./InventoryFormSelect";
import { InventoryFormStatus } from "./InventoryFormStatus";
import { InventoryFormActions } from "./InventoryFormActions";
import { useInventoryForm } from "./useInventoryForm";
import { Separator } from "@/components/ui/separator";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InventoryFormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter item name"
          error={formErrors.name}
        />
        
        <InventoryFormField
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
          placeholder="Enter SKU"
          error={formErrors.sku}
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
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity.toString()}
          onChange={handleChange}
          required
          min="0"
          error={formErrors.quantity}
        />
        
        <InventoryFormField
          label="Reorder Point"
          name="reorderPoint"
          type="number"
          value={formData.reorderPoint.toString()}
          onChange={handleChange}
          required
          min="0"
          error={formErrors.reorderPoint}
          description="Inventory status will be set to 'Low Stock' when quantity falls below this value"
        />
        
        <InventoryFormField
          label="Unit Price"
          name="unitPrice"
          type="number"
          value={formData.unitPrice.toString()}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          error={formErrors.unitPrice}
        />
        
        <InventoryFormField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter storage location"
        />
      </div>
      
      <InventoryFormField
        label="Description"
        name="description"
        value={formData.description || ""}
        onChange={handleChange}
        placeholder="Enter item description"
      />
      
      <Separator className="my-4" />
      
      <h3 className="text-lg font-medium mb-4">Additional Fees</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <InventoryFormActions
        loading={loading}
        onCancel={onCancel}
      />
    </form>
  );
}
