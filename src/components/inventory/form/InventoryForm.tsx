
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInventoryForm } from "@/hooks/inventory/useInventoryForm";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormProps } from "./InventoryForm";
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

  return <InventoryForm {...combinedProps} />;
};
