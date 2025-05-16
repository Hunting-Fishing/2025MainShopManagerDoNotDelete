import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInventoryForm } from "@/hooks/inventory/useInventoryForm";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormProps } from "./InventoryFormProps";
import { InventoryItemExtended } from "@/types/inventory";

interface InventoryCreateFormProps {
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => Promise<void> | void;
  loading: boolean;
  onCancel: () => void;
}

export const InventoryForm: React.FC<InventoryCreateFormProps> = ({
  onSubmit,
  loading,
  onCancel
}) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Pass our props along with the hook generated props to the actual form component
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
    onSubmit,
    loading,
    onCancel
  };

  return <InventoryFormComponent {...combinedProps} />;
};

// The actual form component that uses the props
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
  return (
    <form onSubmit={handleSubmit}>
      <InventoryFormField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
      />
      <InventoryFormField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleTextAreaChange}
        error={formErrors.description}
      />
      <InventoryFormField
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleSelectChange}
        error={formErrors.category}
        options={categories}
      />
      <InventoryFormField
        label="Supplier"
        name="supplier"
        value={formData.supplier}
        onChange={handleSelectChange}
        error={formErrors.supplier}
        options={suppliers}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>
      <Button type="button" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
};
