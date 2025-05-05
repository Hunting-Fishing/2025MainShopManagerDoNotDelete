
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";

export function useInventoryFormValidation() {
  type FormErrors = {
    [key in keyof Omit<InventoryItemExtended, "id" | "status" | "description">]?: string;
  };
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const validateForm = (data: Omit<InventoryItemExtended, "id">) => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Validate name
    if (!data.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    
    // Validate SKU
    if (!data.sku.trim()) {
      errors.sku = "SKU is required";
      isValid = false;
    }
    
    // Validate category
    if (!data.category) {
      errors.category = "Category is required";
      isValid = false;
    }
    
    // Validate supplier
    if (!data.supplier) {
      errors.supplier = "Supplier is required";
      isValid = false;
    }
    
    // Validate quantity (must be a positive number)
    if (data.quantity < 0) {
      errors.quantity = "Quantity cannot be negative";
      isValid = false;
    }
    
    // Validate reorder point (must be a positive number)
    if (data.reorderPoint < 0) {
      errors.reorderPoint = "Reorder point cannot be negative";
      isValid = false;
    }
    
    // Validate unit price (must be a positive number)
    if (data.unitPrice <= 0) {
      errors.unitPrice = "Unit price must be greater than zero";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const clearError = (field: string) => {
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: undefined
      });
    }
  };
  
  return { formErrors, validateForm, clearError };
}
