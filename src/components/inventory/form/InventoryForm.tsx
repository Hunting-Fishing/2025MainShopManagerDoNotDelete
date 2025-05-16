import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InventoryFormProps } from "./InventoryFormProps";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormSelect, SelectOption } from "./InventoryFormSelect";
import { InventoryItemExtended } from "@/types/inventory";

export const InventoryFormComponent: React.FC<InventoryFormProps> = ({
  formData,
  handleChange,
  handleInputChange,
  handleTextAreaChange,
  handleSelectChange,
  handleRadioChange,
  formErrors,
  categories,
  suppliers,
  onSubmit,
  loading,
  onCancel
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Convert string arrays to SelectOption arrays if needed
  const categoryOptions: SelectOption[] = Array.isArray(categories) && categories.length > 0 && typeof categories[0] === 'string' 
    ? (categories as string[]).map(cat => ({ value: cat, label: cat }))
    : categories as SelectOption[];
    
  const supplierOptions: SelectOption[] = Array.isArray(suppliers) && suppliers.length > 0 && typeof suppliers[0] === 'string' 
    ? (suppliers as string[]).map(sup => ({ value: sup, label: sup }))
    : suppliers as SelectOption[];

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InventoryFormField
          label="Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          error={formErrors.name}
          required
        />
        <InventoryFormField
          label="SKU"
          name="sku"
          type="text"
          value={formData.sku}
          onChange={handleInputChange}
          error={formErrors.sku}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InventoryFormField
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleInputChange}
          error={formErrors.quantity}
          required
          min={0}
        />
        <InventoryFormField
          label="Unit Price ($)"
          name="unit_price"
          type="number"
          value={formData.unit_price}
          onChange={handleInputChange}
          error={formErrors.unit_price}
          required
          min={0}
          step={0.01}
        />
        <InventoryFormField
          label="Reorder Point"
          name="reorder_point"
          type="number"
          value={formData.reorder_point}
          onChange={handleInputChange}
          error={formErrors.reorder_point}
          min={0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InventoryFormSelect
          label="Category"
          name="category"
          value={formData.category}
          onChange={(name, value) => handleSelectChange(name, value)}
          error={formErrors.category}
          options={categoryOptions}
          required
        />
        <InventoryFormSelect
          label="Supplier"
          name="supplier"
          value={formData.supplier}
          onChange={(name, value) => handleSelectChange(name, value)}
          error={formErrors.supplier}
          options={supplierOptions}
          required
        />
      </div>

      <div>
        <InventoryFormField
          label="Location"
          name="location"
          type="text"
          value={formData.location || ""}
          onChange={handleInputChange}
          error={formErrors.location}
        />
      </div>

      <div>
        <InventoryFormSelect
          label="Status"
          name="status"
          value={formData.status}
          onChange={(name, value) => handleSelectChange(name, value)}
          error={formErrors.status}
          options={[
            { value: "In Stock", label: "In Stock" },
            { value: "Low Stock", label: "Low Stock" },
            { value: "Out of Stock", label: "Out of Stock" },
            { value: "Discontinued", label: "Discontinued" }
          ]}
        />
      </div>

      <div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleTextAreaChange}
            className={`w-full border rounded p-2 ${formErrors.description ? "border-red-500" : "border-gray-300"}`}
            rows={4}
          />
          {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};

// Export a wrapper component that conforms to the props expected in InventoryAdd page
export const InventoryForm: React.FC<{
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => Promise<void> | void;
  loading: boolean;
  onCancel: () => void;
}> = ({ onSubmit, loading, onCancel }) => {
  const { 
    formData, 
    handleChange, 
    handleInputChange,
    handleTextAreaChange,
    handleSelectChange,
    handleRadioChange,
    validateForm,
    formErrors,
    categories,
    suppliers
  } = useInventoryForm();

  const handleSubmitWrapper = (formData: Omit<InventoryItemExtended, "id">) => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Correct the props to match the expected types
  const combinedProps: InventoryFormProps = {
    formData,
    handleChange,
    handleInputChange,
    handleTextAreaChange,
    handleSelectChange,
    handleRadioChange,
    formErrors,
    categories,
    suppliers,
    onSubmit: handleSubmitWrapper,
    loading,
    onCancel
  };

  return <InventoryFormComponent {...combinedProps} />;
};

import { useInventoryForm } from "@/hooks/inventory/useInventoryForm";
